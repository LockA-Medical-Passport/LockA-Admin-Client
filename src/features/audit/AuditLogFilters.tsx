"use client";

import { type FormEvent, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import {
  AUDIT_ACTION_OPTIONS,
  type AuditActor,
  type AuditAction,
  type AuditLogQuery,
} from "./types";
import { DEFAULT_AUDIT_QUERY, isDefaultAuditFilter, validateAuditDateRange } from "./query";

export interface AuditLogFiltersProps {
  query: AuditLogQuery;
  actors: AuditActor[];
  onChange: (patch: Partial<AuditLogQuery>) => void;
}

export function AuditLogFilters({ query, actors, onChange }: AuditLogFiltersProps) {
  const [search, setSearch] = useState(query.q);
  const [action, setAction] = useState<AuditAction | "all">(query.action);
  const [actor, setActor] = useState(query.actor);
  const [from, setFrom] = useState(query.from);
  const [to, setTo] = useState(query.to);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rangeError = validateAuditDateRange(from, to);
    if (rangeError) {
      setError(rangeError);
      return;
    }
    setError(null);
    onChange({ q: search.trim(), action, actor, from, to, page: 1 });
  }

  function resetFilters() {
    setSearch("");
    setAction(DEFAULT_AUDIT_QUERY.action);
    setActor(DEFAULT_AUDIT_QUERY.actor);
    setFrom("");
    setTo("");
    setError(null);
    onChange({
      q: DEFAULT_AUDIT_QUERY.q,
      action: DEFAULT_AUDIT_QUERY.action,
      actor: DEFAULT_AUDIT_QUERY.actor,
      from: DEFAULT_AUDIT_QUERY.from,
      to: DEFAULT_AUDIT_QUERY.to,
      page: 1,
    });
  }

  const actorOptions = [
    { value: "all", label: "All admins" },
    ...actors.map((option) => ({
      value: option.id ?? option.email ?? option.name,
      label: option.name || option.email || option.id || "Unknown admin",
    })),
    // A linked filter can name an actor that isn't in the current page's list.
    ...(query.actor !== "all" &&
    !actors.some((option) => (option.id ?? option.email ?? option.name) === query.actor)
      ? [{ value: query.actor, label: query.actor }]
      : []),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="glass flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-56 flex-1">
        <Input
          label="Search"
          type="search"
          value={search}
          placeholder="Provider, admin, or note"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          label="Action"
          value={action}
          onChange={(event) => setAction(event.target.value as AuditAction | "all")}
          options={[{ value: "all", label: "All actions" }, ...AUDIT_ACTION_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-52">
        <Select
          label="Admin"
          value={actor}
          onChange={(event) => setActor(event.target.value)}
          options={actorOptions}
        />
      </div>

      <div className="w-full sm:w-40">
        <Input
          label="From"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => setFrom(event.target.value)}
        />
      </div>

      <div className="w-full sm:w-40">
        <Input
          label="To"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => setTo(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
        {!isDefaultAuditFilter(query) && (
          <Button type="button" variant="secondary" onClick={resetFilters}>
            Reset
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="w-full text-sm text-brand-red">
          {error}
        </p>
      )}
    </form>
  );
}
