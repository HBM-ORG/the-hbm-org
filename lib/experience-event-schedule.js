import { DateTime } from "luxon";
import {
  eventDateFieldToUtcIso,
  normalizeEventTimezone,
} from "./zoned-schedule.js";

const DEFAULT_FALLBACK_END_HOURS = 2;

/**
 * Start/end UTC instants for a video/experience calendar event from API payload.
 *
 * Naive yyyy-MM-dd[THH:mm...] is interpreted as wall time in {@link event.timezone}.
 *
 * @param {object|null|undefined} event
 * @param {{ fallbackEndHours?: number }} [opts]
 * @returns {{ start: import("luxon").DateTime | null, end: import("luxon").DateTime | null }}
 */
export function experienceEventUtcBounds(event, opts = {}) {
  const fallbackH =
    typeof opts.fallbackEndHours === "number" && opts.fallbackEndHours > 0
      ? opts.fallbackEndHours
      : DEFAULT_FALLBACK_END_HOURS;

  const ev = event && typeof event === "object" ? event : {};
  const tz = normalizeEventTimezone(ev.timezone);

  const startIso =
    ev.date != null && String(ev.date).trim()
      ? eventDateFieldToUtcIso(ev.date, tz)
      : "";
  let start =
    startIso && DateTime.fromISO(startIso, { zone: "utc" });
  if (!start?.isValid) start = null;

  let end = null;
  const endRaw = ev.endDate != null ? String(ev.endDate).trim() : "";

  if (endRaw) {
    const endIso = eventDateFieldToUtcIso(endRaw, tz);
    const endDt =
      endIso && DateTime.fromISO(endIso, { zone: "utc" });
    if (endDt?.isValid) end = endDt;
  }

  if (start && (!end || !end.isValid || end <= start)) {
    end = start.plus({ hours: fallbackH });
  }

  return {
    start,
    end: end?.isValid ? end : null,
  };
}

/**
 * True when the experience's calendar start day is strictly before today in {@link event.timezone}.
 *
 * Fallback: compares host-local midnight vs host when start cannot be parsed.
 */
export function experienceEventIsPast(event) {
  const { start } = experienceEventUtcBounds(event ?? {});
  if (!start?.isValid) {
    const ev = event ?? {};
    if (!ev.date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(ev.date) < today;
  }
  const ev = event ?? {};
  const tz = normalizeEventTimezone(ev.timezone);
  const startDay = start.setZone(tz).startOf("day");
  const nowDay = DateTime.now().setZone(tz).startOf("day");
  return startDay < nowDay;
}
