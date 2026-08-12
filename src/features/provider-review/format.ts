/**
 * Every timestamp is rendered in UTC with a fixed locale: these components render on the
 * server and hydrate on the client, and a server/browser timezone difference would produce a
 * hydration mismatch. UTC also keeps admins in different regions reading the same audit trail.
 */

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export const EMPTY_VALUE = "—";

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null | undefined): string {
  const date = parseDate(value);
  return date ? DATE_FORMAT.format(date) : EMPTY_VALUE;
}

export function formatDateTime(value: string | null | undefined): string {
  const date = parseDate(value);
  return date ? `${DATE_TIME_FORMAT.format(date)} UTC` : EMPTY_VALUE;
}

/** Keeps long hashes and Stellar addresses readable without hiding which value it is. */
export function truncateMiddle(value: string, lead = 8, tail = 6): string {
  return value.length > lead + tail + 1 ? `${value.slice(0, lead)}…${value.slice(-tail)}` : value;
}

export function formatBytes(bytes: number | undefined): string | undefined {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unitIndex]}`;
}
