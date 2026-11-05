"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { Badge, Button, EmptyState, Table, type TableColumn } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AuditLogFilters } from "./AuditLogFilters";
import { AUDIT_ACTION_LABEL, AUDIT_ACTION_VARIANT, auditTarget } from "./types";
import type { AuditActor, AuditLogEntry, AuditLogPage, AuditLogQuery } from "./types";
import { AUDIT_PAGE_SIZE_OPTIONS, auditHref, auditSearchParams } from "./query";

export interface AuditLogViewProps {
  page: AuditLogPage;
  query: AuditLogQuery;
}

export function AuditLogView({ page, query }: AuditLogViewProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();

  const updateQuery = useCallback(
    (patch: Partial<AuditLogQuery>) => {
      const next = { ...query, ...patch, page: patch.page ?? 1 };
      startTransition(() => router.push(auditHref(next)));
    },
    [query, router],
  );

  const actors = useMemo<AuditActor[]>(() => {
    if (page.actors?.length) return page.actors;
    const seen = new Map<string, AuditActor>();
    for (const entry of page.items) {
      const key = entry.actorEmail ?? entry.actorName;
      if (!seen.has(key)) {
        seen.set(key, {
          id: entry.actorEmail ?? entry.actorName,
          name: entry.actorName,
          email: entry.actorEmail,
        });
      }
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [page.actors, page.items]);

  const exportHref = useMemo(() => {
    const params = auditSearchParams(query);
    params.delete("page");
    params.delete("pageSize");
    const queryString = params.toString();
    return queryString ? `/api/audit-log/export?${queryString}` : "/api/audit-log/export";
  }, [query]);

  const columns: TableColumn<AuditLogEntry>[] = [
    {
      key: "occurredAt",
      header: "When",
      sortable: false,
      render: (row) => (
        <span className="whitespace-nowrap text-foreground/60">
          {formatDateTime(row.occurredAt)}
        </span>
      ),
    },
    {
      key: "actor",
      header: "Admin",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.actorName || "Unknown admin"}</span>
          {row.actorEmail && <span className="text-xs text-foreground/60">{row.actorEmail}</span>}
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (row) => (
        <Badge variant={AUDIT_ACTION_VARIANT[row.action]}>
          {AUDIT_ACTION_LABEL[row.action] ?? row.action}
        </Badge>
      ),
    },
    {
      key: "target",
      header: "Target",
      render: (row) => {
        const target = auditTarget(row);
        if (!target) return <span className="text-foreground/60">—</span>;
        if (!row.targetProviderId) return <span className="text-foreground/80">{target}</span>;
        return (
          <Link
            href={`/applications/${row.targetProviderId}`}
            className="rounded text-foreground hover:text-locka-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
          >
            {target}
          </Link>
        );
      },
    },
    {
      key: "reason",
      header: "Reason / note",
      render: (row) =>
        row.reason ? (
          <span className="text-foreground/80">{row.reason}</span>
        ) : (
          <span className="text-foreground/60">—</span>
        ),
    },
  ];

  const lastPage = Math.max(1, Math.ceil(page.total / query.pageSize));
  const firstRow = page.total === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
  const lastRow = page.total === 0 ? 0 : firstRow + page.items.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Audit log</h1>
          <p className="text-sm text-foreground/60">
            Every admin decision and account change, recorded for accountability and compliance.
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-navy-700/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-navy-600/70 focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 focus-visible:outline-none"
        >
          Export CSV
        </a>
      </div>

      {/* Keyed on the URL so back/forward and shared links remount the form with fresh values. */}
      <AuditLogFilters
        key={auditSearchParams(query).toString()}
        query={query}
        actors={actors}
        onChange={updateQuery}
      />

      <div
        aria-busy={isNavigating || undefined}
        className={cn("transition-opacity", isNavigating && "opacity-60")}
      >
        <Table
          columns={columns}
          data={page.items}
          getRowId={(row) => row.id}
          emptyState={
            <EmptyState
              title="No audit entries match these filters"
              description="Try a different admin, action, or date range."
            />
          }
        />
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-foreground/60">
          {page.total === 0 ? "No entries" : `Showing ${firstRow}–${lastRow} of ${page.total}`}
        </p>

        <div className="flex items-center gap-3">
          <select
            aria-label="Entries per page"
            value={String(query.pageSize)}
            onChange={(event) => updateQuery({ pageSize: Number(event.target.value), page: 1 })}
            className="h-9 rounded-lg border border-white/10 bg-navy-800/60 px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none"
          >
            {AUDIT_PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={query.page <= 1}
              onClick={() => updateQuery({ page: query.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm whitespace-nowrap text-foreground/60">
              Page {query.page} of {lastPage}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={query.page >= lastPage}
              onClick={() => updateQuery({ page: query.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
