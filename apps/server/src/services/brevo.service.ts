import { Buffer } from "buffer";
import { runtimeConfig } from "../config/runtime-config.js";

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

export type BrevoSendResult = {
  provider: "brevo";
  messageId: string;
  status: string;
  raw: Record<string, unknown>;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getBrevoBaseUrl(): string {
  return trimTrailingSlash(runtimeConfig.brevoApiUrl || "https://api.brevo.com/v3");
}

function getBrevoHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": runtimeConfig.brevoApiKey,
  };
}

function parseListIds(raw: string): Record<string, number> {
  return String(raw || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, entry) => {
      const [label, id] = entry.split(":").map((value) => value.trim());
      const parsed = Number(id);
      if (label && Number.isFinite(parsed)) {
        acc[label.toLowerCase()] = parsed;
      }
      return acc;
    }, {});
}

function deriveBrevoListIds(payload: ContactSyncPayload): number[] {
  const configured = parseListIds(runtimeConfig.brevoListIds);
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

async function brevoRequest(path: string, init: RequestInit) {
  const response = await fetch(`${getBrevoBaseUrl()}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : `Brevo request failed: ${response.status}`;
    throw new Error(message);
  }
  return data as Record<string, unknown>;
}

async function lookupBrevoContactByEmail(email: string) {
  return brevoRequest(`/contacts/${encodeURIComponent(email)}`, {
    method: "GET",
    headers: getBrevoHeaders(),
  });
}

export async function upsertBrevoContact(
  payload: ContactSyncPayload,
): Promise<ProviderSyncResult> {
  if (!runtimeConfig.brevoApiKey) {
    return {
      provider: "brevo",
      status: "skipped",
      message: "BREVO_API_KEY not configured",
    };
  }

  const { firstName, lastName } = splitName(payload.name);
  const listIds = deriveBrevoListIds(payload);

  await brevoRequest("/contacts", {
    method: "POST",
    headers: getBrevoHeaders(),
    body: JSON.stringify({
      email: payload.email,
      updateEnabled: true,
      listIds: listIds.length > 0 ? listIds : undefined,
      emailBlacklisted: payload.status.toLowerCase() === "unsubscribed",
      smsBlacklisted: false,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        SMS: payload.phone || undefined,
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
  });

  const contact = await lookupBrevoContactByEmail(payload.email);

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

export async function sendBrevoTransactionalEmail(
  input: BrevoSendInput,
): Promise<BrevoSendResult> {
  if (!runtimeConfig.brevoApiKey) {
    throw new Error("BREVO_API_KEY not configured");
  }

  const data = await brevoRequest("/smtp/email", {
    method: "POST",
    headers: getBrevoHeaders(),
    body: JSON.stringify({
      sender: {
        name: input.from.includes("<")
          ? input.from.split("<")[0].trim()
          : "The HBM",
        email: input.from.match(/<([^>]+)>/)?.[1] || input.from,
      },
      to: [
        {
          email: input.to,
          name: input.toName || input.to,
        },
      ],
      subject: input.subject,
      htmlContent: input.html,
      attachment: (input.attachments || []).map((entry) => ({
        name: entry.filename,
        content: Buffer.from(entry.content, "utf8").toString("base64"),
      })),
    }),
  });

  return {
    provider: "brevo",
    messageId: String(data?.messageId || ""),
    status: "accepted",
    raw: data,
  };
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
