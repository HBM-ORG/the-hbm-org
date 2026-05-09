import { PrismaClient } from "@prisma/client";
import { runtimeConfig } from "../config/runtime-config.js";
import type { SmtpConfigShape } from "./email-support.service.js";
import { resolveEmailProviderConfig, type ResolvedEmailProviderConfig } from "./email-provider-config.service.js";

const prisma = new PrismaClient();

type JsonRecord = Record<string, unknown>;

export type AutomationFlowRuntime = {
  id?: string;
  active?: boolean;
  trigger?: string;
  icon?: string;
  status?: string;
  deliveryMode?: string;
  brevoTemplateId?: string;
  brevoTemplateIdEn?: string;
  brevoTemplateIdHe?: string;
  delayValue?: string | number;
  delayUnit?: string;
  subject_he?: string;
  subject_en?: string;
  subject?: string;
  body_he?: string;
  body_en?: string;
  body?: string;
  includeCalendar?: boolean;
  [key: string]: unknown;
};

export type AutomationSequenceStepRuntime = {
  type?: string;
  duration?: string;
  flowId?: string;
  [key: string]: unknown;
};

export type AutomationSequenceRuntime = {
  id?: string;
  active?: boolean;
  trigger?: string;
  steps?: AutomationSequenceStepRuntime[];
  [key: string]: unknown;
};

export type AutomationRuntimeConfig = {
  flows?: AutomationFlowRuntime[];
  sequences?: AutomationSequenceRuntime[];
  smtp?: SmtpConfigShape | null;
  globalStyling?: JsonRecord;
  providerConfig?: ResolvedEmailProviderConfig;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getLocalizedValue(
  value: unknown,
  language: "en" | "he",
): string {
  if (isRecord(value)) {
    const localized = value[language];
    return typeof localized === "string" ? localized : "";
  }
  return "";
}

function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "P2021"
  );
}

function normalizeAutomationTrigger(trigger: unknown) {
  const value = String(trigger || "").trim();
  const aliases: Record<string, string> = {
    site_signup: "on8MinJourney",
    on_site_signup: "on8MinJourney",
  };
  return aliases[value] || value;
}

function getFlowPriority(flow: {
  active?: boolean;
  deliveryMode?: string | null;
  legacyId?: string | null;
  updatedAt?: Date;
}) {
  let score = 0;
  if (flow.active) score += 10;
  if (flow.deliveryMode && flow.deliveryMode !== "architect_html") score += 5;
  if (flow.legacyId && !String(flow.legacyId).startsWith("flow_")) score += 3;
  if (flow.updatedAt instanceof Date) score += flow.updatedAt.getTime() / 1_000_000_000_000;
  return score;
}

function dedupeAutomationFlows<T extends {
  trigger: string;
  active?: boolean;
  deliveryMode?: string | null;
  legacyId?: string | null;
  updatedAt?: Date;
}>(flows: T[]) {
  const byTrigger = new Map<string, T>();
  for (const flow of flows) {
    const normalized = { ...flow, trigger: normalizeAutomationTrigger(flow.trigger) };
    const key = normalized.trigger.toLowerCase();
    if (!key) continue;
    const current = byTrigger.get(key);
    if (!current || getFlowPriority(normalized) >= getFlowPriority(current)) {
      byTrigger.set(key, normalized);
    }
  }
  return Array.from(byTrigger.values());
}

export async function loadAutomationRuntimeConfig(): Promise<AutomationRuntimeConfig> {
  const [flows, sequences, smtpConfig, globalStyling, providerConfig] = await Promise.all([
    prisma.emailFlow.findMany().catch((error) => {
      if (isMissingTableError(error)) return [];
      throw error;
    }),
    prisma.emailSequence.findMany().catch((error) => {
      if (isMissingTableError(error)) return [];
      throw error;
    }),
    prisma.smtpConfig.findFirst().catch((error) => {
      if (isMissingTableError(error)) return null;
      throw error;
    }),
    prisma.globalStyling.findFirst().catch((error) => {
      if (isMissingTableError(error)) return null;
      throw error;
    }),
    resolveEmailProviderConfig(),
  ]);

  return {
    flows: dedupeAutomationFlows(flows).map((flow) => ({
      id: flow.legacyId || flow.id,
      name: flow.name,
      trigger: normalizeAutomationTrigger(flow.trigger),
      icon: flow.icon || undefined,
      status: flow.status || "published",
      active: flow.active,
      deliveryMode: flow.deliveryMode || "architect_html",
      brevoTemplateId: flow.brevoTemplateId || undefined,
      brevoTemplateIdEn: flow.brevoTemplateIdEn || undefined,
      brevoTemplateIdHe: flow.brevoTemplateIdHe || undefined,
      subject_en: getLocalizedValue(flow.subject, "en"),
      subject_he: getLocalizedValue(flow.subject, "he"),
      body_en: getLocalizedValue(flow.body, "en"),
      body_he: getLocalizedValue(flow.body, "he"),
      includeCalendar: flow.includeCalendar,
      abTestActive: flow.abTestActive,
      subjectB: getLocalizedValue(flow.subjectB, "en") || undefined,
    })),
    sequences: sequences.map((sequence) => ({
      id: sequence.legacyId || sequence.id,
      name: sequence.name,
      trigger: sequence.trigger,
      active: sequence.active,
      steps: Array.isArray(sequence.steps) ? (sequence.steps as AutomationSequenceStepRuntime[]) : [],
    })),
    smtp: smtpConfig
      ? {
          host: smtpConfig.host,
          port: smtpConfig.port,
          user: smtpConfig.user,
          pass: smtpConfig.pass,
          from: smtpConfig.from,
          secure: smtpConfig.secure,
        }
      : null,
    globalStyling: globalStyling
      ? {
          primaryColor: globalStyling.primaryColor,
          secondaryColor: globalStyling.secondaryColor,
          logoUrl: globalStyling.logoUrl,
          fontFamily: globalStyling.fontFamily,
        }
      : {
          primaryColor: runtimeConfig.emailPrimaryColor,
          secondaryColor: runtimeConfig.emailSecondaryColor,
          logoUrl: runtimeConfig.emailLogoUrl,
          fontFamily: runtimeConfig.emailFontFamily,
        },
    providerConfig,
  };
}
