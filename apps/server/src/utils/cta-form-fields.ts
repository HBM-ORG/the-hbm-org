import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const libPath = fileURLToPath(new URL("../../../../lib/cta-form-fields.js", import.meta.url));
const lib = require(libPath) as {
  DEFAULT_CTA_FORM_FIELDS: CtaFormFieldsConfig;
  normalizeCtaFormFields: (
    raw: unknown,
    legacy?: { name?: boolean; email?: boolean; phone?: boolean } | null,
  ) => CtaFormFieldsConfig;
  getCtaFormFieldsForEvent: (event: Record<string, unknown>) => CtaFormFieldsConfig;
  getCtaFormFieldsForVideo: (config: Record<string, unknown>) => CtaFormFieldsConfig;
};

export type CtaFieldRule = { show: boolean; required: boolean };

export type CtaFormFieldsConfig = {
  name: CtaFieldRule;
  email: CtaFieldRule;
  phone: CtaFieldRule;
  source: CtaFieldRule;
  terms: CtaFieldRule;
  marketing: CtaFieldRule;
};

export const DEFAULT_CTA_FORM_FIELDS = lib.DEFAULT_CTA_FORM_FIELDS;
export const normalizeCtaFormFields = lib.normalizeCtaFormFields;
export const getCtaFormFieldsForEvent = lib.getCtaFormFieldsForEvent;
export const getCtaFormFieldsForVideo = lib.getCtaFormFieldsForVideo;
