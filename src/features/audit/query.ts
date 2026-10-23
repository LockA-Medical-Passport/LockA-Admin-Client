import { isAuditAction, type AuditAction, type AuditLogQuery } from "./types";

export const AUDIT_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export const DEFAULT_AUDIT_QUERY: AuditLogQuery = {
  actor: "all",
  action: "all",
  from: "",
  to: "",
  q: "",
  page: 1,
  pageSize: AUDIT_PAGE_SIZE_OPTIONS[0],
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Only a real calendar date survives; `2026-02-31` is rejected rather than rolled over. */
function parseDate(value: string | undefined): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return "";
  return value;
}

export function parseAuditQuery(params: RawSearchParams): AuditLogQuery {
  const action = firstValue(params.action);
  const from = parseDate(firstValue(params.from));
  const to = parseDate(firstValue(params.to));
  const pageSize = parsePositiveInt(firstValue(params.pageSize), DEFAULT_AUDIT_QUERY.pageSize);

  const parsedAction: AuditAction | "all" =
    isAuditAction(action) || action === "all" ? action : DEFAULT_AUDIT_QUERY.action;

  return {
    actor: firstValue(params.actor)?.trim() || DEFAULT_AUDIT_QUERY.actor,
    action: parsedAction,
    from,
    to,
    q: firstValue(params.q)?.trim() ?? DEFAULT_AUDIT_QUERY.q,
    page: parsePositiveInt(firstValue(params.page), DEFAULT_AUDIT_QUERY.page),
    pageSize: (AUDIT_PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
      ? pageSize
      : DEFAULT_AUDIT_QUERY.pageSize,
  };
}

/** Only non-default values are serialized, so an unfiltered log stays a clean `/audit-log`. */
export function auditSearchParams(query: AuditLogQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== DEFAULT_AUDIT_QUERY[key as keyof AuditLogQuery] && value !== "") {
      params.set(key, String(value));
    }
  }
  params.sort();
  return params;
}

export function auditHref(query: AuditLogQuery): string {
  const params = auditSearchParams(query).toString();
  return params ? `/audit-log?${params}` : "/audit-log";
}

export function isDefaultAuditFilter(query: AuditLogQuery): boolean {
  return (
    query.actor === DEFAULT_AUDIT_QUERY.actor &&
    query.action === DEFAULT_AUDIT_QUERY.action &&
    query.from === "" &&
    query.to === "" &&
    query.q === ""
  );
}

/** Validates a date-range pair, returning an error message for the UI. */
export function validateAuditDateRange(from: string, to: string): string | null {
  if (from && to && from > to) return "The start date must be on or before the end date.";
  return null;
}
