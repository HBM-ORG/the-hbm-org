import { Buffer } from "buffer";
import { runtimeConfig } from "../config/runtime-config.js";
import {
  resolveEmailProviderConfig,
  type ResolvedEmailProviderConfig,
} from "./email-provider-config.service.js";
import { getEffectiveBrevoListCatalog } from "./brevo-catalog-resolve.service.js";
import { normalizePhoneForBrevo } from "../utils/phone-e164.js";

export type ContactSyncPayload = {
  email: string;
  name: string;
  phone: string;
  language: string;
  status: string;
  categories: string[];
  sourceChannels: string[];
  acquisitionSources: string[];
  registrationSources: string[];
  eventIds: string[];
  eventNames: string[];
  eventDates: string[];
  latestEventDate: string | null;
  registrationCount: number;
  contactSubmissionCount: number;
  lastRegisteredAt: string | null;
  lastContactSubmissionAt: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastAcquisitionSource: string;
  lastRegistrationSource: string;
  lastSource: string;
};

export type ProviderSyncResult = {
  provider: "brevo";
  status: "synced" | "skipped" | "failed";
  externalId?: string;
  message?: string;
  details?: Record<string, unknown>;
  isUnsubscribed?: boolean;
  isBlocklisted?: boolean;
};

export type BrevoSendInput = {
  from: string;
  to: string;
  toName?: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: string }>;
};

export type BrevoTemplateSendInput = {
  from?: string;
  to: string;
  toName?: string;
  templateId: number;
  params?: Record<string, unknown>;
  attachments?: Array<{ filename: string; content: string }>;
};

export type BrevoSendResult = {
  provider: "brevo";
  messageId: string;
  status: string;
  raw: Record<string, unknown>;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getBrevoBaseUrl(config?: Pick<ResolvedEmailProviderConfig, "brevoApiUrl">): string {
  return trimTrailingSlash(config?.brevoApiUrl || runtimeConfig.brevoApiUrl || "https://api.brevo.com/v3");
}

function getBrevoHeaders(apiKey = runtimeConfig.brevoApiKey): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": apiKey,
  };
}

export function deriveBrevoListIdsWithCatalog(
  payload: ContactSyncPayload,
  configured: Record<string, number>,
): number[] {
  const listIds = new Set<number>();

  if (payload.eventIds.includes("newsletter") && configured.newsletter) {
    listIds.add(configured.newsletter);
  }
  if (
    payload.eventIds.includes("video-event")
    || payload.categories.some((value) => value.toLowerCase().includes("video"))
  ) {
    if (configured.video) listIds.add(configured.video);
  }
  if (
    payload.categories.some((value) => value.toLowerCase().includes("event"))
    && configured.event
  ) {
    listIds.add(configured.event);
  }
  if (configured.general) {
    listIds.add(configured.general);
  }

  return Array.from(listIds);
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/** Brevo allows only one contact per SMS globally; upsert-by-email can fail if the number sits on another profile. */
function isBrevoSmsAlreadyLinkedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const m = error.message;
  return (
    m.includes("SMS is already associated")
    || (m.includes("duplicate_parameter") && m.includes("duplicate_identifiers") && m.includes("SMS"))
  );
}

type BrevoFetchResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
};

/** Typical Brevo responses for POST /contacts; anything else successful is worth flagging in logs. */
const BREVO_CONTACTS_POST_TYPICAL_SUCCESS = new Set([200, 201, 204]);

function logStructuredBrevoUnusualContactsPost2xx(
  postRes: BrevoFetchResult,
  context: Record<string, unknown>,
): void {
  if (!postRes.ok || BREVO_CONTACTS_POST_TYPICAL_SUCCESS.has(postRes.status)) {
    return;
  }
  const line = safeJsonSnippet(
    {
      kind: "brevo_contacts_post_unusual_2xx",
      contactsPostHttpStatus: postRes.status,
      contactsPostBody: postRes.data,
      ...context,
    },
    4000,
  );
  console.warn(`[CRM] Brevo unusual 2xx on POST /contacts ${line}`);
}

function safeJsonSnippet(value: unknown, maxChars: number): string {
  try {
    const s = JSON.stringify(value);
    return !s ? "" : s.length <= maxChars ? s : `${s.slice(0, maxChars)}…`;
  } catch {
    return String(value).slice(0, maxChars);
  }
}

function formatBrevoHttpError(status: number, data: Record<string, unknown>): string {
  const code = typeof data?.code === "string" ? data.code : "";
  const message =
    typeof data?.message === "string"
      ? data.message
      : `Brevo request failed (${status})`;
  const detail =
    data && typeof data === "object" && Object.keys(data).length
      ? ` ${safeJsonSnippet(data, 620)}`
      : "";
  return code ? `${message} (${code})${detail}` : `${message}${detail}`;
}

async function brevoFetch(
  path: string,
  init: RequestInit,
  config?: Pick<ResolvedEmailProviderConfig, "brevoApiUrl">,
): Promise<BrevoFetchResult> {
  const response = await fetch(`${getBrevoBaseUrl(config)}${path}`, init);
  const rawText = await response.text();
  let data: Record<string, unknown> = {};
  if (rawText.trim()) {
    try {
      const parsed = JSON.parse(rawText) as unknown;
      data =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : { _unexpectedShape: parsed };
    } catch {
      data = { _nonJsonResponse: rawText.slice(0, 400) };
    }
  }
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

async function brevoRequest(
  path: string,
  init: RequestInit,
  config?: Pick<ResolvedEmailProviderConfig, "brevoApiUrl">,
) {
  const r = await brevoFetch(path, init, config);
  if (!r.ok) {
    throw new Error(formatBrevoHttpError(r.status, r.data));
  }
  return r.data;
}

/**
 * POST /contacts/lists/{id}/contacts/add. After list re-entry we omit listIds on upsert so this add is the
 * subscription step Brevo automations usually key off of. 400 "already in list" is treated as success.
 */
async function brevoTryAddEmailsToLists(
  emails: string[],
  listIds: number[],
  config: ResolvedEmailProviderConfig,
): Promise<void> {
  const uniqueLists = [...new Set(listIds.filter((n) => Number.isFinite(n) && n > 0))];
  const batch = emails.map((e) => String(e || "").trim().toLowerCase()).filter(Boolean);
  if (batch.length === 0) return;
  for (const listId of uniqueLists) {
    const r = await brevoFetch(`/contacts/lists/${listId}/contacts/add`, {
      method: "POST",
      headers: getBrevoHeaders(config.brevoApiKey),
      body: JSON.stringify({ emails: batch }),
    }, config);
    const line = safeJsonSnippet(
      { listId, httpStatus: r.status, ok: r.ok, brevoBody: r.data },
      700,
    );
    if (!r.ok) {
      const msg =
        typeof r.data?.message === "string"
          ? r.data.message
          : "";
      const benignAlreadyInList =
        r.status === 400
        && msg.toLowerCase().includes("already")
        && msg.toLowerCase().includes("list");
      if (benignAlreadyInList) {
        console.log(`[CRM] Brevo list add (already on list, ok): ${line}`);
      } else {
        console.warn(`[CRM] Brevo list add failed: ${line}`);
      }
    } else {
      console.log(`[CRM] Brevo list add (explicit): ${line}`);
    }
  }
}

async function brevoTryRemoveEmailsFromLists(
  emails: string[],
  listIds: number[],
  config: ResolvedEmailProviderConfig,
): Promise<void> {
  const uniqueLists = [...new Set(listIds.filter((n) => Number.isFinite(n) && n > 0))];
  for (const listId of uniqueLists) {
    const r = await brevoFetch(`/contacts/lists/${listId}/contacts/remove`, {
      method: "POST",
      headers: getBrevoHeaders(config.brevoApiKey),
      body: JSON.stringify({ emails }),
    }, config);
    const line = safeJsonSnippet(
      {
        listId,
        httpStatus: r.status,
        ok: r.ok,
        brevoBody: r.data,
      },
      700,
    );
    if (!r.ok) {
      console.warn(`[CRM] Brevo list remove (may be OK if not on list): ${line}`);
    } else {
      console.log(`[CRM] Brevo list remove prior to re-add: ${line}`);
    }
  }
}

async function lookupBrevoContactByEmail(
  email: string,
  config: ResolvedEmailProviderConfig,
) {
  return brevoRequest(`/contacts/${encodeURIComponent(email)}`, {
    method: "GET",
    headers: getBrevoHeaders(config.brevoApiKey),
  }, config);
}

export type UpsertBrevoContactOptions = {
  /** When set and non-empty, use only these list ids (CTA admin configuration). */
  explicitListIds?: number[];
  /**
   * When false, do not send SMS on the contact (even if phone normalizes).
   * Driven by site settings when syncing from registrations.
   */
  includeSmsAttribute?: boolean;
  /**
   * With env BREVO_REGISTRATION_LIST_REENTRY=true, removes the email from target list IDs (explicit CTA
   * lists or heuristic-derived lists) immediately before POST /contacts so list automations can re-fire.
   */
  registrationListReentry?: boolean;
};

export async function upsertBrevoContact(
  payload: ContactSyncPayload,
  options?: UpsertBrevoContactOptions,
): Promise<ProviderSyncResult> {
  const config = await resolveEmailProviderConfig();
  if (!config.brevoApiKey) {
    return {
      provider: "brevo",
      status: "skipped",
      message: "BREVO_API_KEY not configured",
    };
  }

  const { firstName, lastName } = splitName(payload.name);
  const normalizedEmail = payload.email.trim().toLowerCase();
  const explicit = options?.explicitListIds;
  const catalog = await getEffectiveBrevoListCatalog();
  const listIds =
    explicit && explicit.length > 0
      ? explicit
      : deriveBrevoListIdsWithCatalog(payload, catalog);

  const smsE164 = normalizePhoneForBrevo(payload.phone);
  const allowSms = options?.includeSmsAttribute !== false;
  const shouldSendSms = allowSms && Boolean(smsE164);

  const explicitApplied = !!(explicit?.length && explicit.some((id) => Number.isFinite(id) && id > 0));
  const uniqueTargetListIds = [
    ...new Set(listIds.filter((id) => Number.isFinite(id) && id > 0)),
  ];
  const shouldTryListReentry = Boolean(
    options?.registrationListReentry
      && runtimeConfig.brevoRegistrationListReentry
      && uniqueTargetListIds.length > 0,
  );

  let listReentryRemoveExecuted = false;
  if (shouldTryListReentry && config.brevoApiKey) {
    await brevoTryRemoveEmailsFromLists([normalizedEmail], uniqueTargetListIds, config);
    listReentryRemoveExecuted = true;
  }

  /** If we just removed from lists, do not pass listIds on POST /contacts — it re-adds immediately and blocks a clean "add to list" event (and makes contacts/add return "already in list"). */
  const omitListIdsInContactPost = listReentryRemoveExecuted;

  const buildContactJson = (includeSms: boolean) =>
    JSON.stringify({
      email: normalizedEmail,
      updateEnabled: true,
      listIds:
        omitListIdsInContactPost || listIds.length === 0
          ? undefined
          : listIds,
      emailBlacklisted: payload.status.toLowerCase() === "unsubscribed",
      smsBlacklisted: false,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        FULL_NAME: payload.name,
        LANDLINE_NUMBER: smsE164 || payload.phone || undefined,
        ...(includeSms && smsE164 ? { SMS: smsE164 } : {}),
        LANGUAGE: payload.language,
        STATUS: payload.status,
        CATEGORY: payload.categories.join(" | "),
        EVENT_ID: payload.eventIds.join(" | "),
        EVENT_NAME: payload.eventNames.join(" | "),
        EVENT_DATE: payload.eventDates.join(" | ") || undefined,
        EVENTS_DATE: payload.latestEventDate || undefined,
        LAST_SOURCE: payload.lastSource,
        FROM: payload.lastSource || undefined,
        ACQUISITION_SOURCE: payload.lastAcquisitionSource,
        REGISTRATION_SOURCE: payload.lastRegistrationSource,
        REGISTRATION_COUNT: payload.registrationCount,
        CONTACT_SUBMISSION_COUNT: payload.contactSubmissionCount,
        FIRST_SEEN_AT: payload.firstSeenAt || undefined,
        LAST_SEEN_AT: payload.lastSeenAt || undefined,
        LAST_REGISTERED_AT: payload.lastRegisteredAt || undefined,
      },
    });

  const postContacts = async (includeSms: boolean): Promise<BrevoFetchResult> =>
    brevoFetch(
      "/contacts",
      {
        method: "POST",
        headers: getBrevoHeaders(config.brevoApiKey),
        body: buildContactJson(includeSms),
      },
      config,
    );

  let postRes: BrevoFetchResult;
  try {
    postRes = await postContacts(shouldSendSms);
    if (!postRes.ok) {
      throw new Error(formatBrevoHttpError(postRes.status, postRes.data));
    }
    logStructuredBrevoUnusualContactsPost2xx(postRes, {
      normalizedEmail,
      listsRequested: [...listIds],
      listReentryRemoveExecuted,
    });
  } catch (error) {
    if (shouldSendSms && smsE164 && isBrevoSmsAlreadyLinkedError(error)) {
      console.warn(
        `[CRM] Brevo: SMS ${smsE164} is already linked to another contact; syncing ${normalizedEmail} without SMS`,
      );
      postRes = await postContacts(false);
      if (!postRes.ok) {
        throw new Error(formatBrevoHttpError(postRes.status, postRes.data));
      }
      logStructuredBrevoUnusualContactsPost2xx(postRes, {
        normalizedEmail,
        listsRequested: [...listIds],
        listReentryRemoveExecuted,
        smsRetryWithoutAttribute: true,
      });
    } else {
      throw error;
    }
  }

  if (
    (listReentryRemoveExecuted || explicitApplied)
    && uniqueTargetListIds.length > 0
  ) {
    await brevoTryAddEmailsToLists([normalizedEmail], uniqueTargetListIds, config);
  }

  const contact = await lookupBrevoContactByEmail(normalizedEmail, config);

  /**
   * Brevo often returns 204 No Content on successful contact upsert — not a failure and not "filtered".
   * Transactional / journey mail tied to "contact added to list" usually does not fire again if they were already on the list.
   */
  const contactsDeliveryHint =
    postRes.status === 204 && listIds.length > 0 && !listReentryRemoveExecuted
      ? "204_no_body=normal_for_update: list-add automations often skip when contact already on list; set BREVO_REGISTRATION_LIST_REENTRY=true (heuristic or explicit lists) or send transactional email from app."
      : postRes.status === 204 && listReentryRemoveExecuted
        ? "204_no_body=normal; list_reentry_ran—if mail still missing, check Brevo workflow rules (not HTTP rejection)."
        : undefined;

  const syncTrace = {
    email: normalizedEmail,
    contactsPostHttpStatus: postRes.status,
    contactsPostBody: safeJsonSnippet(postRes.data, 620),
    listsRequested: [...listIds],
    listIdsOmittedInContactPost: omitListIdsInContactPost,
    explicitListStrategy: explicitApplied,
    listReentryRequested: Boolean(options?.registrationListReentry && runtimeConfig.brevoRegistrationListReentry),
    listReentryRemoveExecuted,
    ...(listReentryRemoveExecuted ? { listReentryRemoveListIds: [...uniqueTargetListIds] } : {}),
    syncedAtUtc: new Date().toISOString(),
    ...(contactsDeliveryHint ? { contactsDeliveryHint } : {}),
  };

  console.log(`[CRM] Brevo API summary ${safeJsonSnippet(syncTrace, 1200)}`);

  const summaryMessage = [
    `POST /contacts HTTP ${postRes.status}`,
    typeof contact?.id === "number" || typeof contact?.id === "string"
      ? `contact_id=${contact.id}`
      : "contact_id=unknown",
    `lists=${listIds.join("|")}`,
    `email_blacklisted=${Boolean(contact?.emailBlacklisted)}`,
    `sms_blacklisted=${Boolean(contact?.smsBlacklisted)}`,
    explicitApplied ? "lists_mode=explicit" : "lists_mode=heuristic",
    listReentryRemoveExecuted ? "list_reentry=executed" : "list_reentry=off_or_skipped",
    postRes.status === 204 ? "post_body=brevo_204_typical_contact_upsert" : "",
    contactsDeliveryHint ? `delivery_hint=${contactsDeliveryHint.slice(0, 220)}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const contactObj =
    contact && typeof contact === "object" && !Array.isArray(contact)
      ? ({ ...(contact as Record<string, unknown>) } as Record<string, unknown>)
      : { lookupType: typeof contact, lookupSnippet: safeJsonSnippet(contact, 300) };

  contactObj.syncTrace = syncTrace;

  return {
    provider: "brevo",
    status: "synced",
    message: summaryMessage,
    externalId:
      typeof contact?.id === "number" || typeof contact?.id === "string"
        ? String(contact.id)
        : normalizedEmail,
    details: contactObj,
    isUnsubscribed: Boolean(contact?.emailBlacklisted),
    isBlocklisted: Boolean(contact?.emailBlacklisted),
  };
}

/** Admin-only: add/update a contact and subscribe to specific lists (fires Brevo list automations). */
export async function brevoAdminTestAddToList(input: {
  email: string;
  listIds: number[];
  displayName?: string;
}): Promise<ProviderSyncResult> {
  const config = await resolveEmailProviderConfig();
  if (!config.brevoApiKey) {
    return {
      provider: "brevo",
      status: "skipped",
      message: "BREVO_API_KEY not configured",
    };
  }
  const normalized = input.email.trim().toLowerCase();
  const { firstName, lastName } = splitName(input.displayName || "Admin Test");

  await brevoRequest("/contacts", {
    method: "POST",
    headers: getBrevoHeaders(config.brevoApiKey),
    body: JSON.stringify({
      email: normalized,
      updateEnabled: true,
      listIds: input.listIds,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
      },
    }),
  }, config);

  const contact = await lookupBrevoContactByEmail(normalized, config);

  return {
    provider: "brevo",
    status: "synced",
    externalId:
      typeof contact?.id === "number" || typeof contact?.id === "string"
        ? String(contact.id)
        : normalized,
    details: contact,
  };
}

export async function sendBrevoTransactionalEmail(
  input: BrevoSendInput,
): Promise<BrevoSendResult> {
  const config = await resolveEmailProviderConfig();
  if (!config.brevoApiKey) {
    throw new Error("BREVO_API_KEY not configured");
  }

  const fromEmail = input.from.match(/<([^>]+)>/)?.[1] || input.from || config.brevoSenderEmail;
  const fromName = input.from.includes("<")
    ? input.from.split("<")[0].trim()
    : config.brevoSenderName || "The HBM";
  const attachmentPayload = (input.attachments || [])
    .filter(
      (entry) =>
        entry
        && typeof entry.filename === "string"
        && entry.filename.trim().length > 0
        && typeof entry.content === "string"
        && entry.content.trim().length > 0,
    )
    .map((entry) => ({
      name: entry.filename,
      content: Buffer.from(entry.content, "utf8").toString("base64"),
    }));

  const data = await brevoRequest("/smtp/email", {
    method: "POST",
    headers: getBrevoHeaders(config.brevoApiKey),
    body: JSON.stringify({
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [
        {
          email: input.to,
          name: input.toName || input.to,
        },
      ],
      subject: input.subject,
      htmlContent: input.html,
      attachment: attachmentPayload.length > 0 ? attachmentPayload : undefined,
    }),
  }, config);

  return {
    provider: "brevo",
    messageId: String(data?.messageId || ""),
    status: "accepted",
    raw: data,
  };
}

export async function sendBrevoTemplateEmail(
  input: BrevoTemplateSendInput,
): Promise<BrevoSendResult> {
  const config = await resolveEmailProviderConfig();
  if (!config.brevoApiKey) {
    throw new Error("BREVO_API_KEY not configured");
  }
  if (!Number.isFinite(input.templateId) || input.templateId <= 0) {
    throw new Error("Brevo template ID is required");
  }

  const fromEmail = input.from?.match(/<([^>]+)>/)?.[1] || config.brevoSenderEmail;
  const fromName = input.from?.includes("<")
    ? input.from.split("<")[0].trim()
    : config.brevoSenderName || "The HBM";
  const attachmentPayload = (input.attachments || [])
    .filter(
      (entry) =>
        entry
        && typeof entry.filename === "string"
        && entry.filename.trim().length > 0
        && typeof entry.content === "string"
        && entry.content.trim().length > 0,
    )
    .map((entry) => ({
      name: entry.filename,
      content: Buffer.from(entry.content, "utf8").toString("base64"),
    }));

  const data = await brevoRequest("/smtp/email", {
    method: "POST",
    headers: getBrevoHeaders(config.brevoApiKey),
    body: JSON.stringify({
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [
        {
          email: input.to,
          name: input.toName || input.to,
        },
      ],
      templateId: input.templateId,
      params: input.params || {},
      attachment: attachmentPayload.length > 0 ? attachmentPayload : undefined,
    }),
  }, config);

  return {
    provider: "brevo",
    messageId:
      typeof data?.messageId === "string" ? data.messageId : JSON.stringify(data),
    status: "accepted",
    raw: data,
  };
}

export async function checkBrevoConnection() {
  const config = await resolveEmailProviderConfig();
  if (!config.brevoApiKey) {
    return {
      configured: false,
      connected: false,
      message: "BREVO_API_KEY not configured",
      apiUrl: config.brevoApiUrl,
    };
  }

  try {
    const data = await brevoRequest("/account", {
      method: "GET",
      headers: getBrevoHeaders(config.brevoApiKey),
    }, config);
    return {
      configured: true,
      connected: true,
      message: "Brevo connection verified",
      apiUrl: config.brevoApiUrl,
      account: {
        email: typeof data?.email === "string" ? data.email : undefined,
        companyName: typeof data?.companyName === "string" ? data.companyName : undefined,
      },
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : "Brevo connection failed",
      apiUrl: config.brevoApiUrl,
    };
  }
}

export function verifyBrevoWebhookRequest(headers: Headers | Record<string, unknown>): boolean {
  const secret = runtimeConfig.brevoWebhookSecret;
  if (!secret) return true;

  const readHeader = (name: string) => {
    if (headers instanceof Headers) return headers.get(name) || "";
    const value = headers[name.toLowerCase()] ?? headers[name];
    return typeof value === "string" ? value : "";
  };

  const bearer = readHeader("authorization").replace(/^Bearer\s+/i, "").trim();
  const signature = readHeader("x-brevo-signature").trim();
  const webhookSecret = readHeader("x-webhook-secret").trim();

  return [bearer, signature, webhookSecret].includes(secret);
}
