/**
 * Maps /api/register error payloads to visitor-friendly copy (common to site + admin preview).
 * Prefer server `code`; fall back to `error` for validation messages.
 */

const PHONE_HINT_EN =
  "Use an international mobile number (e.g. +972587073136) or an Israeli mobile (05xxxxxxxx).";
const PHONE_HINT_HE =
  "נא להזין מספר בפורמט בינלאומי (למשל +972587073136) או ישראלי (05xxxxxxxx).";

const BY_CODE = {
  brevo_sms_duplicate: {
    en: "This phone number is already linked to another profile in our system. If you registered before, use the same email address, or try a different phone number, or contact us and we'll help.",
    he: "מספר הטלפון כבר מקושר לפרופיל אחר אצלנו. אם כבר נרשמת בעבר, נסה עם אותה כתובת אימייל; או השתמש במספר טלפון אחר; או צור קשר ונעזור.",
    field: "phone",
  },
  brevo_invalid_phone: {
    en: "We couldn't accept this phone number for SMS updates. Check the format and try again.",
    he: "לא ניתן לשמור את מספר הטלפון לעדכוני SMS. בדוק את הפורמט ונסה שוב.",
    field: "phone",
    hintEn: PHONE_HINT_EN,
    hintHe: PHONE_HINT_HE,
  },
  crm_sync_failed: {
    en: "Your signup was saved, but we couldn't finish syncing to our mailing system. Wait a few minutes and try again, or contact us if it keeps happening.",
    he: "ההרשמה נשמרה, אך לא סיימנו לסנכרן למערכת הדיוור. המתן מספר דקות ונסה שוב, או פנה אלינו אם זה נמשך.",
    field: null,
  },
  video_event_unpublished: {
    en: "Registration for this video event isn't open right now.",
    he: "ההרשמה לאירוע הווידאו אינה פתוחה כרגע.",
    field: null,
  },
  registration_save_failed: {
    en: "We couldn't save your registration. Please try again or contact us.",
    he: "לא הצלחנו לשמור את ההרשמה. נסה שוב או פנה אלינו.",
    field: null,
  },
};

/**
 * @param {Record<string, unknown>} data parsed JSON from /api/register error body
 * @param {(b: { en: string; he: string }, lang: string) => string} t i18n helper
 * @param {string} lang
 * @returns {{ message: string, field: string | null, hint?: string }}
 */
export function registerApiFailureUi(data, t, lang) {
  const code = typeof data?.code === "string" ? data.code : "";
  const entry = code && BY_CODE[code];
  if (entry) {
    const hintFromEntry =
      entry.hintEn && entry.hintHe
        ? lang === "he"
          ? entry.hintHe
          : entry.hintEn
        : undefined;
    return {
      message: t({ en: entry.en, he: entry.he }, lang),
      field:
        typeof data.field === "string" && data.field.trim()
          ? data.field.trim()
          : entry.field || null,
      hint: hintFromEntry,
    };
  }

  const hint = lang === "he" && data.hintHe ? data.hintHe : data.hint;
  const hintStr = typeof hint === "string" ? hint : undefined;

  if (typeof data?.error === "string" && data.error.trim()) {
    return {
      message: data.error.trim(),
      field: typeof data.field === "string" ? data.field : null,
      hint: hintStr,
    };
  }

  return {
    message: t(
      {
        en: "Registration didn't complete. Check your details or try again later.",
        he: "ההרשמה לא הושלמה. בדוק את הפרטים או נסה שוב מאוחר יותר.",
      },
      lang,
    ),
    field: null,
    hint: hintStr,
  };
}
