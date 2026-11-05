"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProviderQueuePage } from "@/features/provider-review/types";
import { useNotifications } from "@/features/notifications/NotificationContext";

export type RealtimeStatus = "connecting" | "live" | "offline";

interface RealtimeContextValue {
  /** Increments whenever the pending queue changes server-side, for `router.refresh()`. */
  revision: number;
  status: RealtimeStatus;
  lastUpdatedAt: string | null;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const DEFAULT_POLL_INTERVAL_MS = 20_000;
const MIN_POLL_INTERVAL_MS = 5_000;

function pollIntervalMs(): number {
  const configured = Number(process.env.NEXT_PUBLIC_QUEUE_POLL_INTERVAL_MS);
  return Number.isFinite(configured) && configured >= MIN_POLL_INTERVAL_MS
    ? configured
    : DEFAULT_POLL_INTERVAL_MS;
}

/**
 * Polling is used instead of a websocket for the MVP: locka-api has no subscription contract
 * yet, polling needs no persistent connection or server-side session fan-out, and a 20s
 * interval is well within the queue's freshness needs. See `docs/REALTIME.md` for the
 * trade-offs and the migration path once locka-api exposes events.
 *
 * Only a lightweight pending-page request is made, and state is compared by provider id and
 * total count. The server components are refreshed only when that signature actually changes,
 * so an unchanged poll is a no-op and rows never duplicate or flicker.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { addNotification } = useNotifications();
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const knownIdsRef = useRef<Set<string> | null>(null);
  const signatureRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const cancelledRef = useRef(false);

  const check = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const response = await fetch(
        "/api/providers/queue?status=pending&page=1&pageSize=100&sort=submittedAt&direction=desc",
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error(`Queue poll failed with status ${response.status}`);

      const page = (await response.json()) as ProviderQueuePage;
      if (cancelledRef.current) return;

      const ids = new Set(page.items.map((provider) => provider.id));
      const signature = `${page.total}:${[...ids].sort().join(",")}`;

      if (knownIdsRef.current === null) {
        // First successful poll establishes the baseline. Mounting the app must not notify
        // the admin about every application that was already pending before they signed in.
        knownIdsRef.current = ids;
        signatureRef.current = signature;
      } else {
        const newProviders = page.items.filter(
          (provider) => !knownIdsRef.current!.has(provider.id),
        );

        for (const provider of newProviders) {
          addNotification({
            id: `application:${provider.id}`,
            kind: "application",
            title: "New provider application",
            message: `${provider.name} submitted an application for review.`,
            href: `/applications/${provider.id}`,
          });
        }

        // A decision by another admin removes a row, so refresh on any signature change, not
        // only on new applications.
        if (signature !== signatureRef.current) {
          setRevision((value) => value + 1);
        }

        knownIdsRef.current = ids;
        signatureRef.current = signature;
      }

      setLastUpdatedAt(new Date().toISOString());
      setStatus("live");
    } catch {
      if (!cancelledRef.current) setStatus("offline");
    } finally {
      inFlightRef.current = false;
    }
  }, [addNotification]);

  useEffect(() => {
    cancelledRef.current = false;
    const interval = pollIntervalMs();
    let timer: ReturnType<typeof setTimeout> | null = null;

    function schedule() {
      if (cancelledRef.current) return;
      timer = setTimeout(run, interval);
    }

    async function run() {
      if (cancelledRef.current) return;
      if (document.visibilityState === "visible") await check();
      schedule();
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      if (timer) clearTimeout(timer);
      void run();
    }

    void run();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelledRef.current = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [check]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ revision, status, lastUpdatedAt }),
    [revision, status, lastUpdatedAt],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
