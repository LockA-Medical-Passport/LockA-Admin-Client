import type { AuditLogEntry } from "@/features/audit/types";
import type { ProviderStatus } from "@/features/provider-review/types";

export interface DashboardSummary {
  /** Number of applications in each `ProviderRegistry` status. */
  counts: Record<ProviderStatus, number>;
  /** Most recent approvals, rejections, suspensions and revocations. */
  recentActivity: AuditLogEntry[];
}
