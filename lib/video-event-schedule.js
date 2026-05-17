import { DateTime } from "luxon";

import {
  coerceWallCalendarDate,
  coerceWallClockTime,
  normalizeEventTimezone,
  utcIsoFromWallParts,
} from "./zoned-schedule.js";

/** Start instant as UTC ISO for countdown / ICS / Google URLs. */
export function videoEventStartUtcIso(cfg) {
  const tz = normalizeEventTimezone(cfg?.timezone);
  const d =
    coerceWallCalendarDate(cfg?.date) ||
    DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
  const t = coerceWallClockTime(cfg?.time ?? "", "09:00");
  return utcIsoFromWallParts(d, t, tz);
}

/** End instant; honors optional end wall date+time, else start + 1 hour. */
export function videoEventEndUtcIso(cfg) {
  const tz = normalizeEventTimezone(cfg?.timezone);
  const sd =
    coerceWallCalendarDate(cfg?.date) ||
    DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
  const st = coerceWallClockTime(cfg?.time ?? "", "09:00");
  const start = DateTime.fromISO(`${sd}T${st}`, { zone: tz });
  if (!start.isValid) return utcIsoFromWallParts(sd, st, tz);

  const ed = coerceWallCalendarDate(cfg?.endDate);
  const et =
    cfg?.endTime != null &&
    typeof cfg.endTime === "string" &&
    cfg.endTime.trim() &&
    /^\d{2}:\d{2}(:\d{2})?$/.test(cfg.endTime.trim())
      ? cfg.endTime.trim().slice(0, 5)
      : "";

  if (ed && et) {
    const end = DateTime.fromISO(`${ed}T${et}`, { zone: tz });
    if (end.isValid) return end.toUTC().toISO() || videoEventStartUtcIso(cfg);
  }

  return start.plus({ hours: 1 }).toUTC().toISO() || videoEventStartUtcIso(cfg);
}
