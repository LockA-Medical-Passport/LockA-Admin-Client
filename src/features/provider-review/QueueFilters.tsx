"use client";

import { useEffect, useMemo, useRef } from "react";
import { Button, Input, Select } from "@/components/ui";
import { PROVIDER_STATUS_OPTIONS, PROVIDER_TYPE_OPTIONS } from "./status";
import { DEFAULT_QUEUE_QUERY, isDefaultQueueFilter, type QueueQuery } from "./query";
import type { ProviderStatus, ProviderType } from "./types";

export interface QueueFiltersProps {
  query: QueueQuery;
  /** Countries present in the queue, so the filter only offers values that can match. */
  countries: string[];
  onChange: (patch: Partial<QueueQuery>) => void;
}

const SEARCH_DEBOUNCE_MS = 350;

export function QueueFilters({ query, countries, onChange }: QueueFiltersProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // What this component last pushed into the URL, so a search round-trip is not mistaken for
  // someone else changing the query.
  const lastEmittedRef = useRef(query.q);

  useEffect(() => () => clearTimeout(debounceRef.current ?? undefined), []);

  // The search box is uncontrolled so typing never waits on a server round-trip. This mirrors
  // the URL back into it only when the change came from somewhere else — a back/forward
  // navigation or a shared link — and never mid-keystroke.
  useEffect(() => {
    if (query.q === lastEmittedRef.current) return;
    lastEmittedRef.current = query.q;
    if (searchRef.current) searchRef.current.value = query.q;
  }, [query.q]);

  function handleSearchInput(value: string) {
    clearTimeout(debounceRef.current ?? undefined);
    debounceRef.current = setTimeout(() => {
      const term = value.trim();
      if (term === query.q) return;
      lastEmittedRef.current = term;
      onChange({ q: term });
    }, SEARCH_DEBOUNCE_MS);
  }

  function resetFilters() {
    clearTimeout(debounceRef.current ?? undefined);
    if (searchRef.current) searchRef.current.value = "";
    lastEmittedRef.current = DEFAULT_QUEUE_QUERY.q;
    onChange({
      status: DEFAULT_QUEUE_QUERY.status,
      type: DEFAULT_QUEUE_QUERY.type,
      country: DEFAULT_QUEUE_QUERY.country,
      q: DEFAULT_QUEUE_QUERY.q,
    });
  }

  // A bookmarked URL can name a country the current queue no longer contains; keep it in the
  // list so the filter still shows what is actually being applied.
  const countryOptions = useMemo(() => {
    const values = new Set(countries);
    if (query.country !== "all") values.add(query.country);
    return [...values].sort();
  }, [countries, query.country]);

  return (
    <div className="glass flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-56 flex-1">
        <Input
          ref={searchRef}
          label="Search"
          type="search"
          defaultValue={query.q}
          placeholder="Provider name or license number"
          onChange={(event) => handleSearchInput(event.target.value)}
        />
      </div>

      <div className="w-full sm:w-44">
        <Select
          label="Status"
          value={query.status}
          onChange={(event) => onChange({ status: event.target.value as ProviderStatus | "all" })}
          options={[{ value: "all", label: "All statuses" }, ...PROVIDER_STATUS_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-52">
        <Select
          label="Provider type"
          value={query.type}
          onChange={(event) => onChange({ type: event.target.value as ProviderType | "all" })}
          options={[{ value: "all", label: "All types" }, ...PROVIDER_TYPE_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-44">
        <Select
          label="Country"
          value={query.country}
          onChange={(event) => onChange({ country: event.target.value })}
          options={[
            { value: "all", label: "All countries" },
            ...countryOptions.map((country) => ({ value: country, label: country })),
          ]}
        />
      </div>

      {!isDefaultQueueFilter(query) && (
        <Button variant="secondary" onClick={resetFilters}>
          Reset filters
        </Button>
      )}
    </div>
  );
}
