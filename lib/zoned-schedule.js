import { DateTime } from "luxon";

/** IANA zone used when interpreting plain date+time fields (wall clock). */
export const DEFAULT_EVENT_TIMEZONE = "Asia/Jerusalem";

export const EVENT_TIMEZONE_OPTIONS = Object.freeze([
  { value: "Asia/Jerusalem", label: "Israel — Asia/Jerusalem" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London — Europe/London" },
  { value: "Europe/Paris", label: "Paris — Europe/Paris" },
  { value: "America/New_York", label: "New York — America/New_York" },
]);

export function normalizeEventTimezone(raw) {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return DEFAULT_EVENT_TIMEZONE;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: s });
    return s;
  } catch {
    return DEFAULT_EVENT_TIMEZONE;
  }
}

/**
 * yyyy-MM-dd (+ optional time) fragment from an API date field (either calendar-only or ISO).
 */
export function coerceWallCalendarDate(raw) {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const s = raw.trim().slice(0, 24);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const head = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return head ? head[1] : "";
}

export function coerceWallClockTime(raw, fallback = "09:00") {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0, 5);
  const fb = typeof fallback === "string" ? fallback.trim() : "09:00";
  return /^\d{2}:\d{2}/.test(fb) ? fb.slice(0, 5) : "09:00";
}

/** Wall clock components in zone from a stored UTC ISO string (experiences CMS). */
export function toWallPartsFromUtcIso(isoUtc, tz) {
  if (!isoUtc || !String(isoUtc).trim()) return { date: "", time: "" };
  const dt = DateTime.fromISO(String(isoUtc), { zone: "utc" });
  if (!dt.isValid) return { date: "", time: "" };
  const local = dt.setZone(normalizeEventTimezone(tz));
  return {
    date: local.toFormat("yyyy-MM-dd"),
    time: local.toFormat("HH:mm"),
  };
}

/** UTC ISO from calendar date + HH:mm interpreted in tz. */
export function utcIsoFromWallParts(dateYmD, timeHm, tz) {
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

/**
 * Whether an ISO-ish string carries Z or an explicit ±offset (absolute instant).
 * Naive strings like 2026-05-29T09:30:00 are false (caller should use event timezone).
 */
export function isoDateTimeStringHasExplicitOffset(s) {
  const t =
    typeof s === "string" ? s.trim() : String(s ?? "").trim();
  if (!t) return false;
  const withoutFracBeforeTz = t.replace(/(\.\d+)(?=Z|[+-])/i, "");
  if (/Z\s*$/i.test(withoutFracBeforeTz)) return true;
  return /[+-]\d{2}(?::\d{2}(?::\d{2})?)?\s*$/i.test(
    withoutFracBeforeTz.replace(/(\.\d+)$/i, ""),
  );
}

/**
 * Normalize event `date` / `endDate` from API/CMS to UTC ISO Z.
 * Absolute strings (with Z or offset): parse as instants.
 * Naive yyyy-MM-dd[THH:mm...]: interpret as wall clock in tzInput (event timezone).
 */
export function eventDateFieldToUtcIso(raw, tzInput) {
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

  const ymd = coerceWallCalendarDate(s) || /^(\d{4}-\d{2}-\d{2})/.exec(s)?.[1] || "";
  if (!ymd) return "";
  const tmMatch = /[T ]\s*(\d{2}:\d{2})(?::\d{2})?/.exec(s);
  const hm = tmMatch ? tmMatch[1].slice(0, 5) : "00:00";
  return utcIsoFromWallParts(ymd, hm, zone);
}

export function toDateTimeLocalValue(rawValue, timeZone = DEFAULT_EVENT_TIMEZONE) {
  const { date, time } = toWallPartsFromUtcIso(rawValue, timeZone);
  if (!date) return "";
  return `${date}T${time}`;
}

/** Legacy name: accepts either `yyyy-MM-ddTHH:mm` or full ISO fragments. */
export function dateTimeLocalInputToIso(combinedLocal, timeZone = DEFAULT_EVENT_TIMEZONE) {
  const trimmed =
    typeof combinedLocal === "string" ? combinedLocal.trim() : String(combinedLocal || "").trim();
  if (!trimmed) return "";
  const [d, maybeT] = trimmed.includes("T")
    ? trimmed.split("T")
    : [trimmed, "00:00"];
  const tPart = maybeT?.slice?.(0, 5) || "00:00";
  return utcIsoFromWallParts(d.slice(0, 10), tPart, timeZone);
}
