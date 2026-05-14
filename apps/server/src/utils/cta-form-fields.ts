/**
 * Mirrors `lib/cta-form-fields.js` (site/admin) so the API server can run when the
 * monorepo `lib/` tree is not on disk (e.g. DigitalOcean source dir = apps/server).
 */

export type CtaFieldRule = { show: boolean; required: boolean };

export type CtaFormFieldsConfig = {
  name: CtaFieldRule;
  email: CtaFieldRule;
  phone: CtaFieldRule;
  source: CtaFieldRule;
  terms: CtaFieldRule;
  marketing: CtaFieldRule;
};

export const DEFAULT_CTA_FORM_FIELDS: CtaFormFieldsConfig = Object.freeze({
  name: { show: true, required: true },
  email: { show: true, required: true },
  phone: { show: true, required: true },
  source: { show: true, required: true },
  terms: { show: true, required: true },
  marketing: { show: true, required: false },
});

const KEYS = [
  "name",
  "email",
  "phone",
  "source",
  "terms",
  "marketing",
] as const satisfies readonly (keyof CtaFormFieldsConfig)[];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeField(
  raw: unknown,
  fallback: CtaFieldRule,
): CtaFieldRule {
  if (!isRecord(raw)) {
    return { ...fallback };
  }
  return {
    show: raw.show !== false,
    required: Boolean(raw.required),
  };
}

export function normalizeCtaFormFields(
  raw: unknown,
  legacy: { name?: boolean; email?: boolean; phone?: boolean } | null = null,
): CtaFormFieldsConfig {
  const src = isRecord(raw) ? raw : {};
  const hasAny = KEYS.some((k) => isRecord(src[k]));

  const out = {} as CtaFormFieldsConfig;
  for (const key of KEYS) {
    if (hasAny && isRecord(src[key])) {
      out[key] = normalizeField(
        src[key],
        DEFAULT_CTA_FORM_FIELDS[key],
      );
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

export function getCtaFormFieldsForEvent(
  event: Record<string, unknown>,
): CtaFormFieldsConfig {
  const reg = isRecord(event.registration) ? event.registration : null;
  const raw = reg?.formFields;
  return normalizeCtaFormFields(raw, null);
}

export function getCtaFormFieldsForVideo(
  config: Record<string, unknown>,
): CtaFormFieldsConfig {
  if (!isRecord(config)) {
    return { ...DEFAULT_CTA_FORM_FIELDS };
  }
  const raw = config.formFields;
  const legacy = config.registrationFields;
  return normalizeCtaFormFields(
    raw,
    isRecord(legacy)
      ? {
          name: typeof legacy.name === "boolean" ? legacy.name : undefined,
          email: typeof legacy.email === "boolean" ? legacy.email : undefined,
          phone: typeof legacy.phone === "boolean" ? legacy.phone : undefined,
        }
      : null,
  );
}
