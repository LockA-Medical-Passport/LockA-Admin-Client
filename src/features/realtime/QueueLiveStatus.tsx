"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useRealtime } from "./RealtimeContext";

const STATUS_COPY = {
  connecting: "Connecting for live updates…",
  live: "Live",
  offline: "Live updates paused — will retry",
} as const;

const STATUS_DOT = {
  connecting: "bg-brand-amber",
  live: "bg-brand-green",
  offline: "bg-brand-red",
} as const;

/**
 * Refreshes the server-rendered queue only when the real-time poller reports an actual change.
 * The table keys rows by provider id, so a refresh updates in place rather than duplicating.
 */
export function QueueLiveStatus() {
  const { revision, status } = useRealtime();
  const router = useRouter();
  const lastRevisionRef = useRef(0);

  useEffect(() => {
    if (revision === lastRevisionRef.current) return;
    lastRevisionRef.current = revision;
    router.refresh();
  }, [revision, router]);

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-foreground/60"
      role="status"
      aria-live="polite"
    >
      <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
      {STATUS_COPY[status]}
    </span>
  );
}
