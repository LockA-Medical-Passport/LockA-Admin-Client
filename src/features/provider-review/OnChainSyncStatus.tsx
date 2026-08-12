"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Spinner } from "@/components/ui";
import { clearPendingSync, getPendingSync, subscribeSyncStore } from "./sync-store";
import type { ProviderApplication } from "./types";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 8; // ~32s of polling before giving up and leaving the indicator as-is

function undefinedSnapshot() {
  return undefined;
}

/**
 * Shows a "syncing" indicator while a just-confirmed decision hasn't shown up yet in
 * locka-api's indexed `onChainStatus`/`lastTxHash` — i.e. the eventual-consistency window
 * between "the transaction landed" and "locka-api's indexer has processed the event".
 */
export function OnChainSyncStatus({ provider }: { provider: ProviderApplication }) {
  const router = useRouter();
  const pendingSync = useSyncExternalStore(
    subscribeSyncStore,
    () => getPendingSync(provider.id),
    undefinedSnapshot,
  );

  const isSynced =
    !pendingSync ||
    (provider.onChainStatus === pendingSync.expectedStatus &&
      provider.lastTxHash === pendingSync.txHash);

  useEffect(() => {
    if (isSynced) {
      if (pendingSync) clearPendingSync(provider.id);
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (attempts > MAX_POLLS) {
        clearInterval(interval);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      // Leaving the page mid-poll shouldn't leave this marker in the store indefinitely — the
      // fallback "registry still reads X" note in ProviderDetail covers the mismatch on any
      // later visit anyway, sourced straight from locka-api rather than this in-memory marker.
      clearPendingSync(provider.id);
    };
  }, [isSynced, pendingSync, provider.id, router]);

  if (isSynced) return null;

  return (
    <p className="flex items-center gap-2 rounded-lg border border-locka-cyan/30 bg-locka-cyan/5 px-3 py-2 text-xs text-locka-cyan">
      <Spinner size="sm" />
      Confirmed on-chain — syncing with locka-api…
    </p>
  );
}
