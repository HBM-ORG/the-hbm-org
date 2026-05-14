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

async function brevoRequest(
  path: string,
  init: RequestInit,
  config?: Pick<ResolvedEmailProviderConfig, "brevoApiUrl">,
) {
  const response = await fetch(`${getBrevoBaseUrl(config)}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : `Brevo request failed: ${response.status}`;
    const detail =
      data && typeof data === "object" && Object.keys(data).length
        ? ` ${JSON.stringify(data).slice(0, 500)}`
        : "";
    throw new Error(`${message}${detail}`);
  }
  return data as Record<string, unknown>;
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
  const explicit = options?.explicitListIds;
  const catalog = await getEffectiveBrevoListCatalog();
  const listIds =
    explicit && explicit.length > 0
      ? explicit
      : deriveBrevoListIdsWithCatalog(payload, catalog);

  const smsE164 = normalizePhoneForBrevo(payload.phone);

  await brevoRequest("/contacts", {
    method: "POST",
    headers: getBrevoHeaders(config.brevoApiKey),
    body: JSON.stringify({
      email: payload.email,
      updateEnabled: true,
      listIds: listIds.length > 0 ? listIds : undefined,
      emailBlacklisted: payload.status.toLowerCase() === "unsubscribed",
      smsBlacklisted: false,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        ...(smsE164 ? { SMS: smsE164 } : {}),
        LANGUAGE: payload.language,
        STATUS: payload.status,
        CATEGORY: payload.categories.join(" | "),
        EVENT_ID: payload.eventIds.join(" | "),
        EVENT_NAME: payload.eventNames.join(" | "),
        LAST_SOURCE: payload.lastSource,
        ACQUISITION_SOURCE: payload.lastAcquisitionSource,
        REGISTRATION_SOURCE: payload.lastRegistrationSource,
        REGISTRATION_COUNT: payload.registrationCount,
        CONTACT_SUBMISSION_COUNT: payload.contactSubmissionCount,
        FIRST_SEEN_AT: payload.firstSeenAt || undefined,
        LAST_SEEN_AT: payload.lastSeenAt || undefined,
        LAST_REGISTERED_AT: payload.lastRegisteredAt || undefined,
      },
    }),
  }, config);

  const contact = await lookupBrevoContactByEmail(payload.email, config);

  return {
    provider: "brevo",
    status: "synced",
    externalId:
      typeof contact?.id === "number" || typeof contact?.id === "string"
        ? String(contact.id)
        : payload.email,
    details: contact,
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
