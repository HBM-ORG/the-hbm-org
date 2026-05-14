/**
 * HTML `datetime-local` value must look like yyyy-MM-ddTHH:mm (no Z, no ms).
 * Event `date` in the API is stored as ISO UTC (e.g. from Prisma / Date.toISOString()).
 */

export function toDateTimeLocalValue(rawValue) {
  if (!rawValue) return "";
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

/** From `datetime-local` input to ISO string for persistence (API / DB). */
export function dateTimeLocalInputToIso(localValue) {
  if (!localValue || !String(localValue).trim()) return "";
  const parsed = new Date(localValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}
