import "server-only";
import { lockaApiJson, withAuth, type LockaApiRequestInit } from "@/lib/locka-api";
import type { AuditLogPage, AuditLogQuery } from "./types";

/**
 * locka-api has not published its audit-log contract yet. As with the other feature APIs,
 * every assumed endpoint and payload shape is isolated here:
 *
 *   GET /admin/audit-log?actor&action&from&to&q&page&pageSize -> AuditLogPage
 *
 * The backend is the source of truth: it records every decision and admin-user change, so
 * this module never reconstructs an audit trail from the provider queue.
 */

const UNREACHABLE = "Unable to reach the audit log service";

/** One export request is capped so a huge log can't exhaust the server's memory. */
export const AUDIT_PAGE_SIZE_FOR_EXPORT = 5000;

function auditParams(query: AuditLogQuery): URLSearchParams {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  if (query.actor !== "all") params.set("actor", query.actor);
  if (query.action !== "all") params.set("action", query.action);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.q) params.set("q", query.q);
  return params;
}

function auditJson<T>(path: string, token: string, init?: LockaApiRequestInit): Promise<T> {
  return lockaApiJson<T>(path, { ...withAuth(token, init), unreachableMessage: UNREACHABLE });
}

export function listAuditLog(token: string, query: AuditLogQuery): Promise<AuditLogPage> {
  return auditJson<AuditLogPage>(`/admin/audit-log?${auditParams(query)}`, token);
}

/** Fetches every matching row for the CSV export, capped so one request can't exhaust memory. */
export async function listAuditLogForExport(
  token: string,
  query: AuditLogQuery,
): Promise<AuditLogPage> {
  const exportQuery: AuditLogQuery = {
    ...query,
    page: 1,
    pageSize: AUDIT_PAGE_SIZE_FOR_EXPORT,
  };
  return auditJson<AuditLogPage>(`/admin/audit-log?${auditParams(exportQuery)}`, token);
}
