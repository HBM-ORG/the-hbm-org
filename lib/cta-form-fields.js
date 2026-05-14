/**
 * Shared CTA registration form configuration (experience pages + video popup).
 * Consumed by apps/site and apps/admin.
 */

/** @typedef {{ show: boolean; required: boolean }} CtaFieldRule */

/**
 * @typedef {{
 *   name: CtaFieldRule;
 *   email: CtaFieldRule;
 *   phone: CtaFieldRule;
 *   source: CtaFieldRule;
 *   terms: CtaFieldRule;
 *   marketing: CtaFieldRule;
 * }} CtaFormFieldsConfig
 */

export const DEFAULT_CTA_FORM_FIELDS = Object.freeze({
  name: { show: true, required: true },
  email: { show: true, required: true },
  phone: { show: true, required: true },
  source: { show: true, required: true },
  terms: { show: true, required: true },
  marketing: { show: true, required: false },
});

const KEYS = ["name", "email", "phone", "source", "terms", "marketing"];

function isRecord(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeField(raw, fallback) {
  if (!isRecord(raw)) {
    return { ...fallback };
  }
  return {
    show: raw.show !== false,
    required: Boolean(raw.required),
  };
}

/**
 * @param {unknown} raw
 * @param {{ name?: boolean; email?: boolean; phone?: boolean } | null} [legacy]
 * @returns {CtaFormFieldsConfig}
 */
export function normalizeCtaFormFields(raw, legacy = null) {
  const src = isRecord(raw) ? raw : {};
  const hasAny = KEYS.some((k) => isRecord(src[k]));

  /** @type {CtaFormFieldsConfig} */
  const out = {};
  for (const key of KEYS) {
    if (hasAny && isRecord(src[key])) {
      out[key] = normalizeField(src[key], DEFAULT_CTA_FORM_FIELDS[key]);
    } else {
      out[key] = { ...DEFAULT_CTA_FORM_FIELDS[key] };
    }
  }

  if (!hasAny && legacy && isRecord(legacy)) {
    if (legacy.name === false) out.name = { show: false, required: false };
    if (legacy.email === false) out.email = { show: false, required: false };
    if (legacy.phone === false) out.phone = { show: false, required: false };
  }

  const anyContact =
    (out.name.show && out.name.required)
    || (out.email.show && out.email.required)
    || (out.phone.show && out.phone.required);
  if (!anyContact) {
    out.email.show = true;
    out.email.required = true;
  }
  return out;
}

/**
 * @param {Record<string, unknown>} event
 * @returns {CtaFormFieldsConfig}
 */
export function getCtaFormFieldsForEvent(event) {
  const reg = isRecord(event?.registration) ? event.registration : null;
  const raw = reg?.formFields;
  return normalizeCtaFormFields(raw, null);
}

/**
 * @param {Record<string, unknown>} config video event config
 * @returns {CtaFormFieldsConfig}
 */
export function getCtaFormFieldsForVideo(config) {
  if (!isRecord(config)) return { ...DEFAULT_CTA_FORM_FIELDS };
  const raw = config.formFields;
  const legacy = config.registrationFields;
  return normalizeCtaFormFields(raw, legacy);
}
