/**
 * Every timestamp in D1 is stored as ISO-8601 UTC with second precision, so
 * rows sort correctly as plain text and browsers parse them without guessing
 * a timezone.
 */
export const SQL_NOW = "strftime('%Y-%m-%dT%H:%M:%SZ','now')";

export function isoNow() {
  return isoSeconds(new Date());
}

export function isoSeconds(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Accepts a datetime-local value or an ISO string; returns storage format. */
export function toIso(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return isoSeconds(parsed);
}
