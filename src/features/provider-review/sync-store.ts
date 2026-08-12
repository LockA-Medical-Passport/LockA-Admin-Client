import type { ProviderStatus } from "./types";

/**
 * Tracks provider decisions that have confirmed on-chain but that locka-api's own
 * `ProviderRegistry` event indexer hasn't reflected yet (`onChainStatus`/`lastTxHash` on
 * `ProviderApplication` come from that indexer, not from this client's own belief about what
 * it just wrote). `OnChainSyncStatus` reads this to show a "syncing" indicator until a
 * refreshed server read shows the indexed data catching up — the eventual-consistency
 * handling called for by the Blockchain/Soroban epic.
 *
 * A plain module-level store (same shape as `components/ui/toast-store.ts`) rather than
 * context: the write that sets this (inside a decision modal) and the read that clears it
 * (the on-chain status panel) sit in different branches of the server-rendered
 * `ProviderDetail` tree, so passing this through props isn't an option.
 */
interface PendingSync {
  txHash: string;
  expectedStatus: ProviderStatus;
}

const pending = new Map<string, PendingSync>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function markPendingSync(
  providerId: string,
  txHash: string,
  expectedStatus: ProviderStatus,
) {
  pending.set(providerId, { txHash, expectedStatus });
  emit();
}

export function clearPendingSync(providerId: string) {
  if (pending.delete(providerId)) emit();
}

export function subscribeSyncStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPendingSync(providerId: string): PendingSync | undefined {
  return pending.get(providerId);
}
