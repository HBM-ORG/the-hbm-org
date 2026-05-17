/** Mirrors repo root `lib/zoned-schedule.js` — keep edits in sync. */
import { DateTime } from "luxon";

export const DEFAULT_EVENT_TIMEZONE = "Asia/Jerusalem";

export const EVENT_TIMEZONE_OPTIONS = Object.freeze([
  { value: "Asia/Jerusalem", label: "Israel — Asia/Jerusalem" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London — Europe/London" },
  { value: "Europe/Paris", label: "Paris — Europe/Paris" },
  { value: "America/New_York", label: "New York — America/New_York" },
]);

export function normalizeEventTimezone(raw: unknown): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return DEFAULT_EVENT_TIMEZONE;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: s });
    return s;
  } catch {
    return DEFAULT_EVENT_TIMEZONE;
  }
}

export function coerceWallCalendarDate(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const s = raw.trim().slice(0, 24);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const head = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return head ? head[1] : "";
}

export function coerceWallClockTime(raw: unknown, fallback = "09:00"): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0, 5);
  const fb = typeof fallback === "string" ? fallback.trim() : "09:00";
  return /^\d{2}:\d{2}/.test(fb) ? fb.slice(0, 5) : "09:00";
}

export function toWallPartsFromUtcIso(isoUtc: unknown, tz: unknown): {
  date: string;
  time: string;
} {
  if (!isoUtc || !String(isoUtc).trim()) return { date: "", time: "" };
  const dt = DateTime.fromISO(String(isoUtc), { zone: "utc" });
  if (!dt.isValid) return { date: "", time: "" };
  const local = dt.setZone(normalizeEventTimezone(tz));
  return {
    date: local.toFormat("yyyy-MM-dd"),
    time: local.toFormat("HH:mm"),
  };
}

export function utcIsoFromWallParts(dateYmD: unknown, timeHm: unknown, tz: unknown): string {
  const d = typeof dateYmD === "string" ? dateYmD.trim() : "";
  const t =
    typeof timeHm === "string" && timeHm.trim()
      ? timeHm.trim().slice(0, 5)
      : "00:00";
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  const dt = DateTime.fromISO(`${d}T${t}`, {
    zone: normalizeEventTimezone(tz),
  });
  if (!dt.isValid) return "";
  const iso = dt.toUTC().toISO();
  return iso || "";
}

export function isoDateTimeStringHasExplicitOffset(s: unknown): boolean {
  const t =
    typeof s === "string" ? s.trim() : String(s ?? "").trim();
  if (!t) return false;
  const withoutFracBeforeTz = t.replace(/(\.\d+)(?=Z|[+-])/i, "");
  if (/Z\s*$/i.test(withoutFracBeforeTz)) return true;
  return /[+-]\d{2}(?::\d{2}(?::\d{2})?)?\s*$/i.test(
    withoutFracBeforeTz.replace(/(\.\d+)$/i, ""),
  );
}

export function eventDateFieldToUtcIso(raw: unknown, tzInput: unknown): string {
  const zone = normalizeEventTimezone(tzInput);
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return "";
    const iso = raw.toISOString?.();
    return typeof iso === "string" ? iso : "";
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const dt = DateTime.fromMillis(raw, { zone: "utc" });
    return dt.isValid ? dt.toISO() || "" : "";
  }
  const s =
    typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
  if (!s) return "";

  if (isoDateTimeStringHasExplicitOffset(s)) {
    const dt = DateTime.fromISO(s, { setZone: true });
    return dt.isValid ? dt.toUTC().toISO() || "" : "";
  }

  const ymd =
    coerceWallCalendarDate(s) || /^(\d{4}-\d{2}-\d{2})/.exec(s)?.[1] || "";
  if (!ymd) return "";
  const tmMatch = /[T ]\s*(\d{2}:\d{2})(?::\d{2})?/.exec(s);
  const hm = tmMatch ? tmMatch[1].slice(0, 5) : "00:00";
  return utcIsoFromWallParts(ymd, hm, zone);
}

export function toDateTimeLocalValue(
  rawValue: unknown,
  timeZone = DEFAULT_EVENT_TIMEZONE,
): string {
  const { date, time } = toWallPartsFromUtcIso(rawValue, timeZone);
  if (!date) return "";
  return `${date}T${time}`;
}

export function dateTimeLocalInputToIso(combinedLocal: unknown, timeZone = DEFAULT_EVENT_TIMEZONE): string {
  const trimmed =
    typeof combinedLocal === "string"
      ? combinedLocal.trim()
      : String(combinedLocal || "").trim();
  if (!trimmed) return "";
  const [d, maybeT] = trimmed.includes("T")
    ? trimmed.split("T")
    : [trimmed, "00:00"];
  const tPart = maybeT?.slice?.(0, 5) || "00:00";
  return utcIsoFromWallParts(d.slice(0, 10), tPart, timeZone);
}
