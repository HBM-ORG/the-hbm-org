import { Prisma, PrismaClient } from "@prisma/client";
import { runtimeConfig } from "../config/runtime-config.js";
import {
  checkBrevoConnection,
  upsertBrevoContact,
  verifyBrevoWebhookRequest,
} from "./brevo.service.js";
import { getContactSyncPayloadByEmail } from "./contact-profile.service.js";
import { upsertEspoContact, verifyEspoWebhookRequest } from "./espocrm.service.js";
import { getPublicEmailProviderConfig, resolveEmailProviderConfig } from "./email-provider-config.service.js";
import { logEngagement } from "./email-tracking.service.js";
import { unsubscribeEmail } from "./suppression.service.js";
import type { BrevoListsForSync } from "./cta-brevo-lists.service.js";

const prisma = new PrismaClient();

type JsonRecord = Record<string, unknown>;

type ProviderName = "brevo" | "espocrm";

type ProviderSyncStatus = "synced" | "skipped" | "failed";

type GenericSyncResult = {
  provider: ProviderName;
  status: ProviderSyncStatus;
  externalId?: string;
  message?: string;
  details?: Record<string, unknown>;
  isUnsubscribed?: boolean;
  isBlocklisted?: boolean;
};

type ProviderWebhookSummary = {
  processed: number;
  duplicates: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function asWebhookEntries(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.map(asRecord).filter((entry) => Object.keys(entry).length > 0);
  }
  const record = asRecord(value);
  return Object.keys(record).length > 0 ? [record] : [];
}

async function getContactProfileIdByEmail(email: string): Promise<string | null> {
  const profile = await prisma.contactProfile.findUnique({
    where: { email: normalizeEmail(email) },
    select: { id: true },
  });
  return profile?.id || null;
}

async function persistProviderSync(email: string, result: GenericSyncResult): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const contactProfileId = await getContactProfileIdByEmail(normalizedEmail);
  const existing = await prisma.contactProviderSync.findFirst({
    where: { provider: result.provider, email: normalizedEmail },
  });

  const data = {
    provider: result.provider,
    email: normalizedEmail,
    contactProfileId,
    externalId: result.externalId || null,
    syncStatus: result.status,
    lastSyncedAt: new Date(),
    lastError: result.status === "failed" ? result.message || "Unknown error" : null,
    isUnsubscribed: Boolean(result.isUnsubscribed),
    isBlocklisted: Boolean(result.isBlocklisted),
    details: (result.details || {}) as Prisma.InputJsonValue,
  };

  if (existing) {
    await prisma.contactProviderSync.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.contactProviderSync.create({ data });
}

async function updateProviderSyncEventState(input: {
  provider: ProviderName;
  email: string;
  externalId?: string;
  eventType: string;
  eventAt: Date;
  details?: JsonRecord;
  isUnsubscribed?: boolean;
  isBlocklisted?: boolean;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  if (!normalizedEmail) return;

  const contactProfileId = await getContactProfileIdByEmail(normalizedEmail);
  const existing = await prisma.contactProviderSync.findFirst({
    where: { provider: input.provider, email: normalizedEmail },
  });

  const data = {
    provider: input.provider,
    email: normalizedEmail,
    contactProfileId,
    externalId: input.externalId || null,
    syncStatus: "synced",
    lastSyncedAt: existing?.lastSyncedAt || null,
    lastError: null,
    isUnsubscribed: Boolean(input.isUnsubscribed || existing?.isUnsubscribed),
    isBlocklisted: Boolean(input.isBlocklisted || existing?.isBlocklisted),
    lastEventType: input.eventType,
    lastEventAt: input.eventAt,
    details: (input.details || existing?.details || {}) as Prisma.InputJsonValue,
  };

  if (existing) {
    await prisma.contactProviderSync.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.contactProviderSync.create({ data });
}

function buildEventKey(provider: ProviderName, payload: JsonRecord): string {
  const rawEventKey =
    normalizeText(payload.id)
    || normalizeText(payload.uuid)
    || normalizeText(payload.eventId)
    || normalizeText(payload.messageId)
    || normalizeText(payload["message-id"])
    || normalizeText(payload.ts_event)
    || normalizeText(payload.date)
    || JSON.stringify(payload);
  return `${provider}:${rawEventKey}`.slice(0, 191);
}

async function createWebhookAuditRecord(input: {
  provider: ProviderName;
  payload: JsonRecord;
  eventType: string;
  email?: string;
  externalId?: string;
}) {
  const eventKey = buildEventKey(input.provider, input.payload);
  const existing = await prisma.providerWebhookEvent.findFirst({
    where: { provider: input.provider, eventKey },
    select: { id: true },
  });

  if (existing) {
    return { created: false, eventKey };
  }

  const row = await prisma.providerWebhookEvent.create({
    data: {
      provider: input.provider,
      eventKey,
      eventType: input.eventType,
      email: input.email ? normalizeEmail(input.email) : null,
      externalId: input.externalId || null,
      payload: input.payload as Prisma.InputJsonValue,
      processedAt: new Date(),
    },
  });

  return { created: true, eventKey, id: row.id };
}

export async function getProviderStatusSummary() {
  const [providerConfig, publicProviderConfig, brevoConnection] = await Promise.all([
    resolveEmailProviderConfig(),
    getPublicEmailProviderConfig(),
    checkBrevoConnection(),
  ]);

  return {
    emailProvider: providerConfig.emailProvider,
    providerConfig: publicProviderConfig,
    brevo: {
      configured: brevoConnection.configured,
      connected: brevoConnection.connected,
      message: brevoConnection.message,
      apiUrl: brevoConnection.apiUrl,
      webhookConfigured: Boolean(runtimeConfig.brevoWebhookSecret),
    },
    espocrm: {
      configured: Boolean(runtimeConfig.espoCrmUrl && runtimeConfig.espoCrmApiKey),
      apiUrl: runtimeConfig.espoCrmUrl,
      webhookConfigured: Boolean(runtimeConfig.espoCrmWebhookSecret),
      contactEntity: runtimeConfig.espoCrmContactEntity,
    },
  };
}

export async function syncContactToProviders(
  email: string,
  brevoLists?: BrevoListsForSync,
) {
  const payload = await getContactSyncPayloadByEmail(email);
  if (!payload) {
    console.warn(
      `[provider-sync] No ContactProfile for ${email}; Brevo/EspoCRM sync skipped (profile should exist after registration rebuild)`,
    );
    return [];
  }

  const brevoOptions =
    brevoLists?.strategy === "explicit"
      ? { explicitListIds: brevoLists.listIds }
      : {};

  const results: GenericSyncResult[] = [];

  try {
    const brevoResult = await upsertBrevoContact(payload, brevoOptions);
    await persistProviderSync(payload.email, brevoResult);
    results.push(brevoResult);
  } catch (error) {
    const failedResult: GenericSyncResult = {
      provider: "brevo",
      status: "failed",
      message: error instanceof Error ? error.message : "Brevo sync failed",
    };
    await persistProviderSync(payload.email, failedResult);
    results.push(failedResult);
  }

  try {
    const espoResult = await upsertEspoContact(payload);
    await persistProviderSync(payload.email, espoResult);
    results.push(espoResult);
  } catch (error) {
    const failedResult: GenericSyncResult = {
      provider: "espocrm",
      status: "failed",
      message: error instanceof Error ? error.message : "EspoCRM sync failed",
    };
    await persistProviderSync(payload.email, failedResult);
    results.push(failedResult);
  }

  return results;
}

function mapBrevoEventType(payload: JsonRecord): string {
  return (
    normalizeText(payload.event)
    || normalizeText(payload.eventType)
    || normalizeText(payload.type)
    || "unknown"
  ).toLowerCase();
}

function mapBrevoEmail(payload: JsonRecord): string {
  return normalizeEmail(
    normalizeText(payload.email)
      || normalizeText(payload.recipient)
      || normalizeText(payload["message-id"]),
  );
}

export async function processBrevoWebhook(
  body: unknown,
  headers: Headers | Record<string, unknown>,
): Promise<ProviderWebhookSummary> {
  if (!verifyBrevoWebhookRequest(headers)) {
    throw new Error("Brevo webhook verification failed");
  }

  const entries = asWebhookEntries(body);
  let processed = 0;
  let duplicates = 0;

  for (const entry of entries) {
    const eventType = mapBrevoEventType(entry);
    const email = mapBrevoEmail(entry);
    const externalId =
      normalizeText(entry["message-id"])
      || normalizeText(entry.messageId)
      || undefined;
    const eventAtRaw =
      normalizeText(entry.date)
      || normalizeText(entry.ts_event)
      || normalizeText(entry.createdAt);
    const eventAt = eventAtRaw ? new Date(eventAtRaw) : new Date();

    const audit = await createWebhookAuditRecord({
      provider: "brevo",
      payload: entry,
      eventType,
      email,
      externalId,
    });

    if (!audit.created) {
      duplicates += 1;
      continue;
    }

    if (email) {
      await logEngagement(externalId || audit.eventKey, eventType, email, {
        provider: "brevo",
        providerMessageId: externalId || "",
        rawEvent: entry,
      });

      const shouldSuppress = [
        "unsubscribed",
        "spam",
        "complaint",
        "hard_bounce",
        "blocked",
      ].includes(eventType);

      if (shouldSuppress) {
        await unsubscribeEmail(email);
      }

      await updateProviderSyncEventState({
        provider: "brevo",
        email,
        externalId,
        eventType,
        eventAt,
        details: entry,
        isUnsubscribed: ["unsubscribed", "complaint", "spam"].includes(eventType),
        isBlocklisted: ["blocked", "hard_bounce"].includes(eventType),
      });
    }

    processed += 1;
  }

  return { processed, duplicates };
}

export async function processEspoWebhook(
  body: unknown,
  headers: Headers | Record<string, unknown>,
): Promise<ProviderWebhookSummary> {
  if (!verifyEspoWebhookRequest(headers)) {
    throw new Error("EspoCRM webhook verification failed");
  }

  const entries = asWebhookEntries(body);
  let processed = 0;
  let duplicates = 0;

  for (const entry of entries) {
    const eventType =
      normalizeText(entry.eventType)
      || normalizeText(entry.type)
      || normalizeText(entry.status)
      || "update";
    const email = normalizeEmail(normalizeText(entry.email));
    const externalId = normalizeText(entry.id) || undefined;
    const eventAtRaw =
      normalizeText(entry.createdAt)
      || normalizeText(entry.updatedAt)
      || normalizeText(entry.date);
    const eventAt = eventAtRaw ? new Date(eventAtRaw) : new Date();

    const audit = await createWebhookAuditRecord({
      provider: "espocrm",
      payload: entry,
      eventType,
      email,
      externalId,
    });

    if (!audit.created) {
      duplicates += 1;
      continue;
    }

    if (email) {
      await updateProviderSyncEventState({
        provider: "espocrm",
        email,
        externalId,
        eventType,
        eventAt,
        details: entry,
      });
    }

    processed += 1;
  }

  return { processed, duplicates };
}
