import { PrismaClient } from "@prisma/client";
import type { CtaFormFieldsConfig } from "../types/content.js";
import {
  normalizePhoneForBrevo,
  PHONE_HINT_EN,
  PHONE_HINT_HE,
} from "../utils/phone-e164.js";
import { getVideoEventConfig } from "./content.service.js";
import {
  getCtaFormFieldsForEvent,
  getCtaFormFieldsForVideo,
} from "../utils/cta-form-fields.js";

const prisma = new PrismaClient();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getCtaFormConfigForRegister(
  eventId: string,
): Promise<CtaFormFieldsConfig> {
  if (eventId === "video-event") {
    const config = await getVideoEventConfig();
    return getCtaFormFieldsForVideo(config as Record<string, unknown>);
  }

  const row = await prisma.event.findFirst({
    where: { OR: [{ id: eventId }, { legacyId: eventId }] },
    select: { registration: true },
  });

  const reg = row?.registration;
  return getCtaFormFieldsForEvent({
    registration: isRecord(reg) ? reg : {},
  });
}

function nonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

export type RegisterBodyFields = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  source?: unknown;
  termsAccepted?: unknown;
};

export type RegisterValidationIssue = {
  field: "name" | "email" | "phone" | "source" | "terms";
  code: string;
  message: string;
  hint?: string;
  hintHe?: string;
};

export function validateRegisterBodyAgainstRules(
  body: RegisterBodyFields,
  rules: CtaFormFieldsConfig,
): RegisterValidationIssue | null {
  if (rules.name.show && rules.name.required && !nonEmptyString(body.name)) {
    return {
      field: "name",
      code: "required",
      message: "Please enter your name.",
    };
  }
  if (
    rules.email.show
    && rules.email.required
    && !nonEmptyString(body.email)
  ) {
    return {
      field: "email",
      code: "required",
      message: "Please enter your email address.",
    };
  }
  if (
    rules.phone.show
    && rules.phone.required
    && !nonEmptyString(body.phone)
  ) {
    return {
      field: "phone",
      code: "required",
      message: "Please enter your phone number.",
      hint: PHONE_HINT_EN,
      hintHe: PHONE_HINT_HE,
    };
  }
  if (rules.phone.show) {
    const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (rawPhone.length > 0 && !normalizePhoneForBrevo(rawPhone)) {
      return {
        field: "phone",
        code: "invalid_phone",
        message: "This phone number could not be recognized.",
        hint: PHONE_HINT_EN,
        hintHe: PHONE_HINT_HE,
      };
    }
  }
  if (
    rules.source.show
    && rules.source.required
    && !nonEmptyString(body.source)
  ) {
    return {
      field: "source",
      code: "required",
      message: "Please choose how you heard about us.",
    };
  }
  if (rules.terms.show && rules.terms.required && body.termsAccepted !== true) {
    return {
      field: "terms",
      code: "terms_required",
      message: "Please accept the terms to continue.",
    };
  }
  return null;
}
