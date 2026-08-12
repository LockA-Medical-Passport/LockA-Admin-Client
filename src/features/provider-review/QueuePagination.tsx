"use client";

import { Button, Select } from "@/components/ui";
import { PAGE_SIZE_OPTIONS, type QueueQuery } from "./query";

export interface QueuePaginationProps {
  query: QueueQuery;
  total: number;
  /** Rows on the current page, so the "showing" range stays honest on a short last page. */
  pageCount: number;
  onChange: (patch: Partial<QueueQuery>) => void;
}

export function QueuePagination({ query, total, pageCount, onChange }: QueuePaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / query.pageSize));
  const firstRow = total === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
  const lastRow = total === 0 ? 0 : firstRow + pageCount - 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-foreground/60">
        {total === 0 ? "No applications" : `Showing ${firstRow}–${lastRow} of ${total}`}
      </p>

      <div className="flex items-center gap-3">
        <Select
          aria-label="Applications per page"
          value={String(query.pageSize)}
          onChange={(event) => onChange({ pageSize: Number(event.target.value), page: 1 })}
          options={PAGE_SIZE_OPTIONS.map((size) => ({
            value: String(size),
            label: `${size} per page`,
          }))}
          className="h-9 py-0"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={query.page <= 1}
            onClick={() => onChange({ page: query.page - 1 })}
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
            onClick={() => onChange({ page: query.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
