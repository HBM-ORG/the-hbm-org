import { PrismaClient } from "@prisma/client";
import { runtimeConfig } from "../config/runtime-config.js";
import type { SmtpConfigShape } from "./email-support.service.js";

const prisma = new PrismaClient();

type JsonRecord = Record<string, unknown>;

export type AutomationFlowRuntime = {
  id?: string;
  active?: boolean;
  trigger?: string;
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

export async function loadAutomationRuntimeConfig(): Promise<AutomationRuntimeConfig> {
  const [flows, sequences, smtpConfig, globalStyling] = await Promise.all([
    prisma.emailFlow.findMany(),
    prisma.emailSequence.findMany(),
    prisma.smtpConfig.findFirst(),
    prisma.globalStyling.findFirst(),
  ]);

  return {
    flows: flows.map((flow) => ({
      id: flow.legacyId || flow.id,
      name: flow.name,
      trigger: flow.trigger,
      active: flow.active,
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
  };
}
