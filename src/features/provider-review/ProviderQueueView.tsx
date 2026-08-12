"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Button, EmptyState, Table, type TableColumn } from "@/components/ui";
import { cn } from "@/lib/utils";
import { BulkDecisionModal } from "./BulkDecisionModal";
import { ProviderStatusBadge } from "./ProviderStatusBadge";
import { QueueFilters } from "./QueueFilters";
import { QueuePagination } from "./QueuePagination";
import { formatDate } from "./format";
import { queueHref, queueSearchParams, type QueueQuery, type QueueSortKey } from "./query";
import { PROVIDER_TYPE_LABEL, type DecisionAction } from "./status";
import type { ProviderApplication, ProviderQueuePage } from "./types";

export interface ProviderQueueViewProps {
  page: ProviderQueuePage;
  query: QueueQuery;
}

/** Bulk decisions only apply to applications still awaiting review. */
function isPendingApplication(provider: ProviderApplication) {
  return provider.status === "pending";
}

export function ProviderQueueView({ page, query }: ProviderQueueViewProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<DecisionAction | null>(null);

  const updateQuery = useCallback(
    (patch: Partial<QueueQuery>) => {
      // Any filter/sort change invalidates the current page number: page 4 of the old result
      // set is meaningless against the new one.
      const next = { ...query, ...patch, page: patch.page ?? 1 };
      startTransition(() => router.push(queueHref(next)));
    },
    [query, router],
  );

  // Selection is scoped to what is on screen, so a stale id from a previous page can never be
  // swept into a bulk action the admin can't see.
  const selectedProviders = useMemo(
    () => page.items.filter((provider) => selectedIds.has(provider.id)),
    [page.items, selectedIds],
  );

  const visibleSelectedIds = useMemo(
    () => new Set(selectedProviders.map((provider) => provider.id)),
    [selectedProviders],
  );

  const countries = useMemo(
    () => page.countries ?? [...new Set(page.items.map((provider) => provider.country))].sort(),
    [page.countries, page.items],
  );

  // The detail view's back link returns to this exact queue state, so working through a
  // filtered list doesn't reset to the default view after every application.
  const detailHref = useCallback(
    (id: string) => {
      const from = queueSearchParams(query).toString();
      return from ? `/applications/${id}?from=${encodeURIComponent(from)}` : `/applications/${id}`;
    },
    [query],
  );

  const columns: TableColumn<ProviderApplication>[] = [
    {
      key: "name",
      header: "Provider",
      sortable: true,
      render: (row) => (
        <Link
          href={detailHref(row.id)}
          // The row itself navigates too; without this the link and the row would both fire
          // and push two history entries for one click.
          onClick={(event) => event.stopPropagation()}
          className="font-medium text-foreground hover:text-locka-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50 rounded"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <span className="text-foreground/80">{PROVIDER_TYPE_LABEL[row.type]}</span>,
    },
    {
      key: "country",
      header: "Country",
      render: (row) => <span className="text-foreground/80">{row.country}</span>,
    },
    {
      key: "submittedAt",
      header: "Submitted",
      sortable: true,
      render: (row) => <span className="text-foreground/60">{formatDate(row.submittedAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <ProviderStatusBadge status={row.status} />,
    },
  ];

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Provider applications</h1>
          <p className="text-sm text-foreground/60">
            Review health provider registrations and record decisions in the ProviderRegistry.
          </p>
        </div>
      </div>

      <QueueFilters query={query} countries={countries} onChange={updateQuery} />

      {selectedProviders.length > 0 && (
        <div className="glass-bright flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
          <p className="text-sm text-foreground/80">
            {selectedProviders.length}{" "}
            {selectedProviders.length === 1 ? "application" : "applications"} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={clearSelection}>
              Clear
            </Button>
            <Button variant="danger" size="sm" onClick={() => setBulkAction("reject")}>
              Reject selected
            </Button>
            <Button variant="success" size="sm" onClick={() => setBulkAction("approve")}>
              Approve selected
            </Button>
          </div>
        </div>
      )}

      <div
        aria-busy={isNavigating || undefined}
        className={cn("transition-opacity", isNavigating && "opacity-60")}
      >
        <Table
          columns={columns}
          data={page.items}
          getRowId={(row) => row.id}
          selectable
          selectedIds={visibleSelectedIds}
          onSelectionChange={setSelectedIds}
          isRowSelectable={isPendingApplication}
          sortKey={query.sort}
          sortDirection={query.direction}
          onSortChange={(key, direction) => updateQuery({ sort: key as QueueSortKey, direction })}
          onRowClick={(row) => router.push(detailHref(row.id))}
          emptyState={
            <EmptyState
              title="No applications match these filters"
              description="Try a different status, provider type, or search term."
            />
          }
        />
      </div>

      <QueuePagination
        query={query}
        total={page.total}
        pageCount={page.items.length}
        onChange={updateQuery}
      />

      <BulkDecisionModal
        key={bulkAction ?? "closed"}
        action={bulkAction}
        providers={selectedProviders}
        onClose={() => setBulkAction(null)}
        onCompleted={() => {
          setBulkAction(null);
          clearSelection();
          router.refresh();
        }}
      />
    </div>
  );
}
