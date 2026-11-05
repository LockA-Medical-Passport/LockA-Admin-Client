/**
 * Domain types for the global audit log.
 *
 * locka-api owns the audit trail: every provider decision and admin-user change is recorded
 * there as an immutable entry. This module only describes the shape the admin client renders
 * and exports, so the endpoint contract stays isolated in `./api.ts`.
 */

export const AUDIT_ACTIONS = [
  "approved",
  "rejected",
  "suspended",
  "revoked",
  "staff_revoked",
  "admin_invited",
  "admin_deactivated",
  "admin_reactivated",
  "admin_role_changed",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditActor {
  id?: string;
  name: string;
  email?: string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  /** ISO-8601 timestamp of when the action was recorded. */
  occurredAt: string;
  actorName: string;
  actorEmail?: string;
  targetProviderId?: string;
  targetProviderName?: string;
  /** Used for admin-user entries, which have no provider target. */
  targetLabel?: string;
  reason?: string;
  txHash?: string;
}

export interface AuditLogPage {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  /** Admins that appear in the audit log, used to populate the actor filter. */
  actors?: AuditActor[];
}

export interface AuditLogQuery {
  actor: string;
  action: AuditAction | "all";
  /** Inclusive `YYYY-MM-DD` date bounds, empty when the filter is not applied. */
  from: string;
  to: string;
  q: string;
  page: number;
  pageSize: number;
}

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  revoked: "Revoked",
  staff_revoked: "Staff revoked",
  admin_invited: "Admin invited",
  admin_deactivated: "Admin deactivated",
  admin_reactivated: "Admin reactivated",
  admin_role_changed: "Admin role changed",
};

export type AuditActionVariant = "green" | "amber" | "red" | "cyan" | "gray";

export const AUDIT_ACTION_VARIANT: Record<AuditAction, AuditActionVariant> = {
  approved: "green",
  rejected: "red",
  suspended: "amber",
  revoked: "red",
  staff_revoked: "amber",
  admin_invited: "cyan",
  admin_deactivated: "gray",
  admin_reactivated: "green",
  admin_role_changed: "cyan",
};

export const AUDIT_ACTION_OPTIONS = AUDIT_ACTIONS.map((action) => ({
  value: action,
  label: AUDIT_ACTION_LABEL[action],
}));

export function isAuditAction(value: unknown): value is AuditAction {
  return AUDIT_ACTIONS.includes(value as AuditAction);
}

/** Most audit entries point at a provider; admin-user changes carry a free-text label instead. */
export function auditTarget(entry: AuditLogEntry): string | undefined {
  return entry.targetProviderName ?? entry.targetLabel;
}
