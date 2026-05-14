/**
 * Brevo contact SMS / phone attributes expect E.164-style numbers (+country…).
 * Normalize common Israeli mobile patterns; return undefined if we cannot map safely
 * (caller should omit the attribute so the contact upsert still succeeds).
 */
export function normalizePhoneForBrevo(raw: string): string | undefined {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return undefined;
  const compact = trimmed.replace(/[\s\-().]/g, "");
  if (/^\+[1-9]\d{7,14}$/.test(compact)) {
    return compact;
  }
  const digits = compact.replace(/\D/g, "");
  if (!digits.length) return undefined;

  if (digits.startsWith("972") && digits.length >= 11 && digits.length <= 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) {
    const rest = digits.slice(1);
    if (rest.startsWith("5")) {
      return `+972${rest}`;
    }
  }
  if (digits.length === 9 && digits.startsWith("5")) {
    return `+972${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("5")) {
    return `+972${digits}`;
  }

  return undefined;
}

export const PHONE_HINT_EN =
  "Use an international mobile number (e.g. +972587073136) or an Israeli mobile (05xxxxxxxx).";
export const PHONE_HINT_HE =
  "נא להזין מספר בפורמט בינלאומי (למשל +972587073136) או ישראלי (05xxxxxxxx).";
