"use client";

import { type ReactNode, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export type SortDirection = "asc" | "desc";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  /** Rows this returns false for get a disabled checkbox and are skipped by select-all. */
  isRowSelectable?: (row: T) => boolean;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;
  className?: string;
}

const SKELETON_ROWS = 5;

export function Table<T>({
  columns,
  data,
  getRowId,
  loading = false,
  emptyState,
  onRowClick,
  selectable = false,
  selectedIds,
  onSelectionChange,
  isRowSelectable,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSortChange,
  className,
}: TableProps<T>) {
  const isControlledSort = controlledSortKey !== undefined && onSortChange !== undefined;
  const [localSort, setLocalSort] = useState<{ key: string; direction: SortDirection } | null>(
    null,
  );

  const activeSort = useMemo(() => {
    if (!isControlledSort) return localSort;
    return controlledSortKey
      ? { key: controlledSortKey, direction: controlledSortDirection ?? ("asc" as SortDirection) }
      : null;
  }, [isControlledSort, controlledSortKey, controlledSortDirection, localSort]);

  const rows = useMemo(() => {
    if (isControlledSort || !activeSort) return data;
    const column = columns.find((c) => c.key === activeSort.key);
    if (!column?.sortValue) return data;
    const sorted = [...data].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    if (activeSort.direction === "desc") sorted.reverse();
    return sorted;
  }, [data, columns, activeSort, isControlledSort]);

  function toggleSort(column: TableColumn<T>) {
    if (!column.sortable) return;
    const nextDirection: SortDirection =
      activeSort?.key === column.key && activeSort.direction === "asc" ? "desc" : "asc";

    if (isControlledSort) {
      onSortChange!(column.key, nextDirection);
    } else {
      setLocalSort({ key: column.key, direction: nextDirection });
    }
  }

  const selectableRows = useMemo(
    () => (isRowSelectable ? rows.filter(isRowSelectable) : rows),
    [rows, isRowSelectable],
  );

  function toggleAll() {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(selectableRows.map(getRowId)));
  }

  function toggleRow(id: string) {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  const allSelected =
    selectableRows.length > 0 && selectableRows.every((row) => selectedIds?.has(getRowId(row)));
  const someSelected =
    !allSelected && selectableRows.some((row) => selectedIds?.has(getRowId(row)));

  return (
    <div className={cn("glass overflow-x-auto rounded-xl", className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={allSelected}
                  disabled={selectableRows.length === 0}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="size-4 rounded border-white/20 bg-navy-800 accent-locka-cyan disabled:opacity-30"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-semibold tracking-wide text-foreground/60 uppercase",
                  column.className,
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50 rounded"
                  >
                    {column.header}
                    <SortIcon
                      active={activeSort?.key === column.key}
                      direction={activeSort?.direction}
                    />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/5">
                {selectable && (
                  <td className="px-4 py-3">
                    <Skeleton shape="block" className="size-4" />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton shape="text" className="w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center"
              >
                {emptyState ?? <span className="text-sm text-foreground/50">No data</span>}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const id = getRowId(row);
              const isSelected = !!selectedIds?.has(id);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-white/5 transition-colors last:border-b-0",
                    onRowClick && "cursor-pointer hover:bg-white/5",
                    isSelected && "bg-locka-cyan/5",
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={isSelected}
                        disabled={isRowSelectable ? !isRowSelectable(row) : false}
                        onChange={() => toggleRow(id)}
                        className="size-4 rounded border-white/20 bg-navy-800 accent-locka-cyan disabled:opacity-30"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3", column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ active, direction }: { active?: boolean; direction?: SortDirection }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3">
      <path
        d="M3 4.5 6 2l3 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active && direction === "asc" ? "text-locka-cyan" : "text-foreground/30"}
      />
      <path
        d="M3 7.5 6 10l3-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active && direction === "desc" ? "text-locka-cyan" : "text-foreground/30"}
      />
    </svg>
  );
}
