/**
 * Compact calendar popover + time input for schedules (experience UTC + video wall-clock).
 */
import React, { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { DateTime } from "luxon";
import "react-day-picker/style.css";

import {
  coerceWallCalendarDate,
  coerceWallClockTime,
  normalizeEventTimezone,
  toWallPartsFromUtcIso,
  utcIsoFromWallParts,
  EVENT_TIMEZONE_OPTIONS,
} from "../../../../../lib/zoned-schedule.js";

function wallYmdDisplay(ymd, tz) {
  if (!ymd) return "";
  const zone = normalizeEventTimezone(tz);
  const dt = DateTime.fromISO(`${ymd}T12:00:00`, { zone });
  return dt.isValid ? dt.toFormat("dd/MM/yyyy") : ymd;
}

function CalendarPopoverBody({
  timeZone,
  ymd,
  pick,
  allowClear,
}) {
  const tz = normalizeEventTimezone(timeZone);
  const dtFromYmd = ymd
    ? DateTime.fromISO(`${ymd}T12:00:00`, { zone: tz })
    : null;
  const selected =
    dtFromYmd?.isValid && dtFromYmd ? dtFromYmd.toJSDate() : undefined;
  const defaultMonth =
    selected || DateTime.now().setZone(tz).startOf("month").toJSDate();

  return (
    <>
      <DayPicker
        mode="single"
        timeZone={tz}
        captionLayout="dropdown"
        navLayout="around"
        weekStartsOn={0}
        selected={selected}
        defaultMonth={defaultMonth}
        onSelect={(picked) => {
          if (!picked) return;
          const next = DateTime.fromJSDate(picked, {
            zone: tz,
          }).toFormat("yyyy-MM-dd");
          pick(next);
        }}
        className="rounded-xl text-sm"
        style={
          /** @type {React.CSSProperties} */
          ({
            "--rdp-accent-color": "#38bdf8",
            "--rdp-background-color": "#27272a",
            "--rdp-weekday-opacity": "0.7",
          })
        }
        classNames={{
          root: "text-zinc-100",
          month_caption:
            "flex justify-center capitalize font-semibold pb-3 text-sm text-white",
          month_grid: "",
          weekdays: "text-[11px] text-zinc-400 font-semibold uppercase",
          weekday: "",
          today: "",
          hidden: "",
          disabled: "",
          outside: "",
          focused: "",
          day_button:
            "h-9 w-9 rounded-lg text-[13px] font-medium text-white hover:bg-zinc-700",
          selected: "!bg-sky-500 !text-black font-bold hover:!bg-sky-400",
        }}
      />
      <div className="flex justify-between border-t border-zinc-600/70 pt-2 mt-1 text-[11px] font-bold uppercase tracking-wide">
        <button
          type="button"
          className={`rounded-lg px-2 py-1.5 tracking-tighter text-sky-400 hover:bg-zinc-800 hover:text-white ${
            !allowClear ? "invisible pointer-events-none" : ""
          }`}
          disabled={!allowClear}
          onClick={() => {
            if (!allowClear) return;
            pick("");
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="rounded-lg px-2 py-1.5 tracking-tighter text-sky-400 hover:bg-zinc-800 hover:text-white"
          onClick={() => {
            const td = DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
            pick(td);
          }}
        >
          Today
        </button>
      </div>
    </>
  );
}

function CalendarPopoverTrigger({
  timeZone,
  ymd,
  onSelectYmd,
  placeholder,
  allowClear,
}) {
  const tz = normalizeEventTimezone(timeZone);
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative flex-1 min-w-[9rem]" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left font-mono text-sm text-gray-900 transition-colors hover:bg-white hover:border-purple-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/30 min-h-[3rem]"
      >
        <span
          className={ymd ? "font-semibold" : "text-gray-400 font-bold text-xs uppercase tracking-wider"}
        >
          {ymd ? wallYmdDisplay(ymd, tz) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-purple-400" />
      </button>
      {open ? (
        <div
          className="absolute z-[400] mt-2 w-[min(calc(100vw-3rem),20rem)] rounded-2xl border border-zinc-600 bg-[#161618] p-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-[0.985] duration-150"
          role="dialog"
          aria-label="Choose date"
        >
          <CalendarPopoverBody
            timeZone={timeZone}
            ymd={ymd}
            pick={(next) => {
              onSelectYmd(next);
              setOpen(false);
            }}
            allowClear={allowClear}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Experience/events schedule row: converts wall date+time in `timezone` to UTC ISO for storage.
 * `fallbackWallYmd` helps optional END rows: adjusting end time without an end date uses that calendar day (e.g. start date).
 */
export function ZonedUtcScheduleRow({
  labelDate,
  labelTime,
  timezone,
  isoUtc,
  onIsoUtc,
  allowIsoClear = false,
  datePlaceholder,
  fallbackWallYmd = "",
}) {
  const tz = normalizeEventTimezone(timezone);
  const committedIso = isoUtc && String(isoUtc).trim();
  const parts = committedIso
    ? toWallPartsFromUtcIso(isoUtc, tz)
    : { date: "", time: "" };
  const todayYmd = () => DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
  const fbYmd =
    typeof fallbackWallYmd === "string"
      ? fallbackWallYmd.trim().slice(0, 10)
      : "";
  const fbValid = /^\d{4}-\d{2}-\d{2}$/.test(fbYmd);

  /** Optional end rows must not pretend a default time exists in the DOM when DB has no end instant. */
  const timeControlValue =
    allowIsoClear && !committedIso
      ? parts.time || ""
      : parts.time || "09:00";
  const timeDisabled =
    Boolean(allowIsoClear) &&
    !committedIso &&
    !fbValid &&
    !(typeof parts.date === "string" && parts.date.trim());

  const pushIso = (dYmd, tHm) => {
    const dd = typeof dYmd === "string" ? dYmd.trim() : "";
    const ttRaw = typeof tHm === "string" ? tHm.trim().slice(0, 5) : "";
    if (!dd) {
      if (allowIsoClear) onIsoUtc("");
      return;
    }
    const tt =
      ttRaw ||
      (/^\d{2}:\d{2}$/.test(parts.time || "") ? parts.time : "09:00") ||
      "09:00";
    const iso = utcIsoFromWallParts(dd.slice(0, 10), tt, tz);
    if (iso) onIsoUtc(iso);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,minmax(6.5rem,8rem)] sm:items-end">
        <div>
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
            {labelDate}
          </span>
          <CalendarPopoverTrigger
            timeZone={timezone}
            ymd={parts.date}
            placeholder={datePlaceholder ?? "Select date"}
            allowClear={allowIsoClear}
            onSelectYmd={(nextYmd) => pushIso(nextYmd, parts.time)}
          />
        </div>
        <div>
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
            {labelTime}
          </span>
          <input
            type="time"
            step={300}
            value={timeControlValue}
            disabled={timeDisabled}
            onChange={(e) => {
              const y =
                (typeof parts.date === "string" && parts.date.trim()) ||
                (allowIsoClear && fbValid ? fbYmd : "") ||
                (!allowIsoClear ? todayYmd() : "");
              if (!y) return;
              pushIso(y, e.target.value);
            }}
            title={
              timeDisabled
                ? "Pick an end date first (or set a valid start date for same-day default)"
                : undefined
            }
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm focus:border-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 min-h-[3rem] disabled:opacity-45"
          />
        </div>
      </div>
    </div>
  );
}

/** Video-event CMS stores plain calendar date strings (yyyy-mm-dd) + hh:mm wall clock. */
export function VideoWallScheduleBlock({
  timezone,
  dateYmd,
  timeHm,
  endDateYmd,
  endTimeHm,
  onPatch,
}) {
  const tz = normalizeEventTimezone(timezone);
  const today = () => DateTime.now().setZone(tz).toFormat("yyyy-MM-dd");
  const startYmd = coerceWallCalendarDate(dateYmd) || today();
  const t = coerceWallClockTime(timeHm, "09:00");
  const ed = coerceWallCalendarDate(endDateYmd || "");
  const et =
    endTimeHm &&
    typeof endTimeHm === "string" &&
    /^\d{2}:\d{2}(:\d{2})?$/.test(endTimeHm.trim())
      ? endTimeHm.trim().slice(0, 5)
      : "";

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
          Event timezone
        </label>
        <select
          value={tz}
          onChange={(e) =>
            onPatch({ timezone: normalizeEventTimezone(e.target.value) })
          }
          className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs font-bold text-gray-900"
        >
          {EVENT_TIMEZONE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[9px] text-gray-500 leading-relaxed">
          Start/end are interpreted in this zone before converting for countdown
          and calendar exports on the site.
        </p>
      </div>

      <div>
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
          Start date &amp; time
        </span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,minmax(6.5rem,8rem)] sm:items-end">
          <CalendarPopoverTrigger
            timeZone={tz}
            ymd={startYmd}
            placeholder="Select date"
            allowClear={false}
            onSelectYmd={(next) =>
              onPatch({
                date: next || today(),
              })
            }
          />
          <input
            type="time"
            step={300}
            value={t}
            onChange={(e) => onPatch({ time: e.target.value })}
            className="min-h-[3rem] w-full rounded-xl border border-gray-50 bg-gray-50 p-4 font-mono text-sm focus:border-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20"
          />
        </div>
      </div>

      <div>
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
          End date &amp; time{" "}
          <span className="font-semibold lowercase text-[9px] text-gray-500">
            optional
          </span>
        </span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,minmax(6.5rem,8rem)] sm:items-end">
          <CalendarPopoverTrigger
            timeZone={tz}
            ymd={ed}
            placeholder="dd/mm/yyyy, --:--"
            allowClear
            onSelectYmd={(next) =>
              onPatch({
                endDate: next,
                ...(next ? {} : { endTime: "" }),
              })
            }
          />
          <input
            type="time"
            step={300}
            value={et}
            disabled={!ed}
            onChange={(e) =>
              onPatch({
                endTime: e.target.value,
              })
            }
            placeholder="--:--"
            className="min-h-[3rem] w-full rounded-xl border border-gray-50 bg-gray-50 p-4 font-mono text-sm disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20"
          />
        </div>
        <p className="mt-2 text-[9px] text-gray-400">
          If omitted, countdown and ICS use one hour after the start time.
        </p>
      </div>
    </div>
  );
}
