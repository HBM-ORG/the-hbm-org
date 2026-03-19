import { runtimeConfig } from "../config/runtime-config.js";
import type { ContactSyncPayload } from "./brevo.service.js";

export type EspoSyncResult = {
  provider: "espocrm";
  status: "synced" | "skipped" | "failed";
  externalId?: string;
  message?: string;
  details?: Record<string, unknown>;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getEspoBaseUrl(): string {
  return trimTrailingSlash(runtimeConfig.espoCrmUrl);
}

function getEspoHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Api-Key": runtimeConfig.espoCrmApiKey,
  };
}

async function espoRequest(path: string, init: RequestInit) {
  const response = await fetch(`${getEspoBaseUrl()}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : `EspoCRM request failed: ${response.status}`;
    throw new Error(message);
  }
  return data as Record<string, unknown>;
}

async function findEspoContactByEmail(email: string) {
  const entity = encodeURIComponent(runtimeConfig.espoCrmContactEntity);
  const query = new URLSearchParams({
    "where[0][type]": "equals",
    "where[0][attribute]": "emailAddress",
    "where[0][value]": email,
    maxSize: "1",
  });

  const data = await espoRequest(`/api/v1/${entity}?${query.toString()}`, {
    method: "GET",
    headers: getEspoHeaders(),
  });

  const list = Array.isArray(data?.list) ? data.list : [];
  return (list[0] || null) as Record<string, unknown> | null;
}

function buildEspoPayload(payload: ContactSyncPayload) {
  return {
    name: payload.name,
    emailAddress: payload.email,
    phoneNumber: payload.phone || undefined,
    description: JSON.stringify({
      language: payload.language,
      categories: payload.categories,
      sourceChannels: payload.sourceChannels,
      acquisitionSources: payload.acquisitionSources,
      registrationSources: payload.registrationSources,
      eventIds: payload.eventIds,
      eventNames: payload.eventNames,
      registrationCount: payload.registrationCount,
      contactSubmissionCount: payload.contactSubmissionCount,
      lastRegisteredAt: payload.lastRegisteredAt,
      lastContactSubmissionAt: payload.lastContactSubmissionAt,
      lastSeenAt: payload.lastSeenAt,
      hbmStatus: payload.status,
    }),
  };
}

export async function upsertEspoContact(
  payload: ContactSyncPayload,
): Promise<EspoSyncResult> {
  if (!runtimeConfig.espoCrmUrl || !runtimeConfig.espoCrmApiKey) {
    return {
      provider: "espocrm",
      status: "skipped",
      message: "ESPOCRM_URL or ESPOCRM_API_KEY not configured",
    };
  }

  const entity = encodeURIComponent(runtimeConfig.espoCrmContactEntity);
  const existing = await findEspoContactByEmail(payload.email);
  const body = JSON.stringify(buildEspoPayload(payload));

  if (existing && typeof existing.id === "string" && existing.id.trim()) {
    const updated = await espoRequest(`/api/v1/${entity}/${existing.id}`, {
      method: "PUT",
      headers: getEspoHeaders(),
      body,
    });

    return {
      provider: "espocrm",
      status: "synced",
      externalId: String(updated?.id || existing.id),
      details: updated,
    };
  }

  const created = await espoRequest(`/api/v1/${entity}`, {
    method: "POST",
    headers: getEspoHeaders(),
    body,
  });

  return {
    provider: "espocrm",
    status: "synced",
    externalId: String(created?.id || ""),
    details: created,
  };
}

export function verifyEspoWebhookRequest(headers: Headers | Record<string, unknown>): boolean {
  const secret = runtimeConfig.espoCrmWebhookSecret;
  if (!secret) return true;

  const readHeader = (name: string) => {
    if (headers instanceof Headers) return headers.get(name) || "";
    const value = headers[name.toLowerCase()] ?? headers[name];
    return typeof value === "string" ? value : "";
  };

  const bearer = readHeader("authorization").replace(/^Bearer\s+/i, "").trim();
  const webhookSecret = readHeader("x-webhook-secret").trim();

  return [bearer, webhookSecret].includes(secret);
}
