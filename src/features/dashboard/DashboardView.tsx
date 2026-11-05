import Link from "next/link";
import { Badge, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import {
  AUDIT_ACTION_LABEL,
  AUDIT_ACTION_VARIANT,
  auditTarget,
  type AuditLogEntry,
} from "@/features/audit/types";
import { PROVIDER_STATUS_LABEL, PROVIDER_STATUS_VARIANT } from "@/features/provider-review/status";
import { PROVIDER_STATUSES, type ProviderStatus } from "@/features/provider-review/types";
import type { DashboardSummary } from "./types";

const STATUS_ACCENT: Record<ProviderStatus, string> = {
  pending: "text-brand-amber",
  verified: "text-brand-green",
  suspended: "text-foreground/70",
  revoked: "text-brand-red",
};

const STATUS_BORDER: Record<ProviderStatus, string> = {
  pending: "hover:border-brand-amber/40",
  verified: "hover:border-brand-green/40",
  suspended: "hover:border-white/25",
  revoked: "hover:border-brand-red/40",
};

function StatCard({ status, count }: { status: ProviderStatus; count: number }) {
  return (
    <Link
      href={`/applications?status=${status}`}
      className={`glass group flex flex-col gap-2 rounded-xl border p-5 transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 focus-visible:outline-none ${STATUS_BORDER[status]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-foreground/60 uppercase">
          {PROVIDER_STATUS_LABEL[status]}
        </span>
        <Badge variant={PROVIDER_STATUS_VARIANT[status]}>{PROVIDER_STATUS_LABEL[status]}</Badge>
      </div>
      <span className={`text-3xl font-semibold tabular-nums ${STATUS_ACCENT[status]}`}>
        {count.toLocaleString("en-US")}
      </span>
      <span className="text-xs text-foreground/60 group-hover:text-locka-cyan">
        View applications →
      </span>
    </Link>
  );
}

function RecentActivityList({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No recent activity"
        description="Approvals and rejections will appear here as admins review applications."
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-white/5">
      {entries.map((entry) => {
        const target = auditTarget(entry);
        return (
          <li key={entry.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={AUDIT_ACTION_VARIANT[entry.action]}>
                  {AUDIT_ACTION_LABEL[entry.action] ?? entry.action}
                </Badge>
                {target && (
                  <span className="text-sm font-medium text-foreground">
                    {entry.targetProviderId ? (
                      <Link
                        href={`/applications/${entry.targetProviderId}`}
                        className="rounded hover:text-locka-cyan focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none"
                      >
                        {target}
                      </Link>
                    ) : (
                      target
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/60">
                {entry.actorName || "Unknown admin"} · {formatDateTime(entry.occurredAt)}
              </p>
              {entry.reason && <p className="text-sm text-foreground/70">{entry.reason}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function DashboardView({ summary }: { summary: DashboardSummary }) {
  const total = PROVIDER_STATUSES.reduce((sum, status) => sum + (summary.counts[status] ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-foreground/60">
          {total.toLocaleString("en-US")} provider {total === 1 ? "application" : "applications"}{" "}
          across the registry.
        </p>
      </div>

      <section aria-label="Application summary">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PROVIDER_STATUSES.map((status) => (
            <StatCard key={status} status={status} count={summary.counts[status] ?? 0} />
          ))}
        </div>
      </section>

      <section className="glass flex flex-col gap-2 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">
              Recent activity
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              The latest decisions recorded against provider applications.
            </p>
          </div>
          <Link
            href="/audit-log"
            className="rounded text-sm text-locka-cyan hover:underline focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none"
          >
            View full audit log →
          </Link>
        </div>
        <RecentActivityList entries={summary.recentActivity ?? []} />
      </section>
    </div>
  );
}
