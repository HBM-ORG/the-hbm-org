import { PrismaClient } from "@prisma/client";
import { runtimeConfig } from "../config/runtime-config.js";

const prisma = new PrismaClient();
const CONFIG_ID = "default";

type ProviderConfigInput = {
  emailProvider?: unknown;
  brevoApiUrl?: unknown;
  brevoApiKey?: unknown;
  brevoSenderName?: unknown;
  brevoSenderEmail?: unknown;
  brevoAutomationEnabled?: unknown;
};

export type ResolvedEmailProviderConfig = {
  emailProvider: string;
  brevoApiUrl: string;
  brevoApiKey: string;
  brevoSenderName: string;
  brevoSenderEmail: string;
  brevoAutomationEnabled: boolean;
  brevoApiKeySource: "env" | "database" | "none";
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProvider(value: unknown): string | null {
  const raw = normalizeText(value).toLowerCase();
  return raw === "brevo" || raw === "smtp" ? raw : null;
}

function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function isMaskedSecret(value: string): boolean {
  return value.includes("*") || value.includes("...");
}

async function getStoredProviderConfig() {
  return prisma.emailProviderConfig.findUnique({ where: { id: CONFIG_ID } });
}

export async function resolveEmailProviderConfig(): Promise<ResolvedEmailProviderConfig> {
  const stored = await getStoredProviderConfig().catch(() => null);
  const dbApiKey = normalizeText(stored?.brevoApiKey);
  const envApiKey = runtimeConfig.brevoApiKey;
  const brevoApiKey = dbApiKey || envApiKey;

  return {
    emailProvider:
      normalizeProvider(stored?.emailProvider) || runtimeConfig.emailProvider || "smtp",
    brevoApiUrl: normalizeText(stored?.brevoApiUrl) || runtimeConfig.brevoApiUrl,
    brevoApiKey,
    brevoSenderName: normalizeText(stored?.brevoSenderName) || "The HBM",
    brevoSenderEmail:
      normalizeText(stored?.brevoSenderEmail)
      || runtimeConfig.defaultSmtpFrom.match(/<([^>]+)>/)?.[1]
      || runtimeConfig.defaultSmtpFrom,
    brevoAutomationEnabled: Boolean(stored?.brevoAutomationEnabled),
    brevoApiKeySource: dbApiKey ? "database" : envApiKey ? "env" : "none",
  };
}

export async function getPublicEmailProviderConfig() {
  const stored = await getStoredProviderConfig().catch(() => null);
  const resolved = await resolveEmailProviderConfig();

  return {
    emailProvider: resolved.emailProvider,
    brevoApiUrl: resolved.brevoApiUrl,
    brevoApiKey: "",
    brevoApiKeyMasked: maskSecret(resolved.brevoApiKey),
    brevoApiKeySource: resolved.brevoApiKeySource,
    brevoConfigured: Boolean(resolved.brevoApiKey),
    brevoSenderName: resolved.brevoSenderName,
    brevoSenderEmail: resolved.brevoSenderEmail,
    brevoAutomationEnabled: resolved.brevoAutomationEnabled,
    hasDatabaseOverride: Boolean(stored),
  };
}

export async function saveEmailProviderConfig(input: ProviderConfigInput = {}) {
  const existing = await getStoredProviderConfig().catch(() => null);
  const apiKey = normalizeText(input.brevoApiKey);
  const shouldUpdateApiKey = apiKey.length > 0 && !isMaskedSecret(apiKey);

  const data = {
    emailProvider: normalizeProvider(input.emailProvider) || existing?.emailProvider || null,
    brevoApiUrl: normalizeText(input.brevoApiUrl) || null,
    ...(shouldUpdateApiKey ? { brevoApiKey: apiKey } : {}),
    brevoSenderName: normalizeText(input.brevoSenderName) || null,
    brevoSenderEmail: normalizeText(input.brevoSenderEmail) || null,
    brevoAutomationEnabled: Boolean(input.brevoAutomationEnabled),
  };

  await prisma.emailProviderConfig.upsert({
    where: { id: CONFIG_ID },
    update: data,
    create: {
      id: CONFIG_ID,
      ...data,
      brevoApiKey: shouldUpdateApiKey ? apiKey : existing?.brevoApiKey || null,
    },
  });
}
