import { dismissToast, toast } from "@/components/ui";
import type { FreighterWallet } from "@/features/auth/useFreighterWallet";
import {
  buildDecisionTransaction,
  confirmTransaction,
  submitSignedTransaction,
} from "@/lib/soroban/provider-registry";
import { SorobanError, errorMessage } from "@/lib/soroban/errors";
import { DECISION_COPY, type DecisionAction } from "./status";
import type {
  BulkDecisionResult,
  ProviderApplication,
  ProviderDecisionResult,
  ProviderStaffRevocationResult,
} from "./types";

/**
 * Client-side calls into this app's own route handlers. The browser never talks to locka-api
 * directly — the session token is httpOnly — so every off-chain mutation goes through
 * `/api/providers/*`. The on-chain write for a provider decision (this module's main job) is
 * different: it's signed and submitted from the browser via the admin's own Freighter wallet
 * (see `lib/soroban/provider-registry.ts`), and locka-api only learns about it afterwards, to
 * record the reason/note against the now-confirmed transaction.
 */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return { ok: false, message: payload?.message ?? "Something went wrong. Please try again." };
    }
    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, message: "Unable to reach the server. Check your connection and retry." };
  }
}

/**
 * Shows a sticky "in flight" toast for the duration of the call, so an action that waits on a
 * network round trip reads as pending -> success/failure rather than as a frozen button. Still
 * used by flows that stay entirely server-side (e.g. staff revocation); the on-chain decision
 * flow below uses `DecisionProgress`/`TransactionStatus` instead, since it has several
 * meaningfully different phases worth showing individually.
 */
export async function withPendingToast<T>(
  message: string,
  run: () => Promise<ApiResult<T>>,
): Promise<ApiResult<T>> {
  const toastId = toast.pending(message);
  try {
    return await run();
  } finally {
    dismissToast(toastId);
  }
}

/** Where a single decision's on-chain + off-chain submission currently is. */
export type DecisionPhase =
  | "idle"
  | "building"
  | "awaiting-signature"
  | "submitting"
  | "confirming"
  | "recording"
  | "confirmed"
  | "failed";

export interface DecisionProgress {
  phase: DecisionPhase;
  txHash?: string;
  message?: string;
}

export type DecisionOutcome =
  | {
      ok: true;
      provider: ProviderApplication;
      txHash: string;
      /** Set when the on-chain write succeeded but recording the reason with locka-api didn't. */
      warning?: string;
    }
  | { ok: false; message: string };

/**
 * Runs one provider decision end to end: build the `ProviderRegistry` invocation, get it
 * signed in Freighter, submit and confirm it on-chain, then ask locka-api to record the
 * reason against that confirmed transaction. `onProgress` fires as each phase starts, so a
 * modal can show the admin exactly where things are instead of one long spinner.
 */
export async function submitOnChainDecision(
  provider: ProviderApplication,
  action: DecisionAction,
  reason: string | undefined,
  wallet: FreighterWallet,
  onProgress?: (progress: DecisionProgress) => void,
): Promise<DecisionOutcome> {
  const report = (phase: DecisionPhase, extra?: Partial<DecisionProgress>) =>
    onProgress?.({ phase, ...extra });

  if (!wallet.publicKey) {
    const message = "Connect your Freighter wallet to submit this decision on-chain.";
    report("failed", { message });
    return { ok: false, message };
  }

  report("building");
  let unsignedXdr: string;
  try {
    unsignedXdr = await buildDecisionTransaction({
      action,
      providerAddress: provider.walletAddress,
      adminAddress: wallet.publicKey,
    });
  } catch (error) {
    const message = error instanceof SorobanError ? error.message : errorMessage(error);
    report("failed", { message });
    return { ok: false, message };
  }

  report("awaiting-signature");
  const signed = await wallet.signTransaction(unsignedXdr);
  if (!signed.ok) {
    report("failed", { message: signed.error });
    return { ok: false, message: signed.error };
  }

  report("submitting");
  let txHash: string;
  try {
    ({ txHash } = await submitSignedTransaction(signed.signedXdr));
  } catch (error) {
    const message = error instanceof SorobanError ? error.message : errorMessage(error);
    report("failed", { message });
    return { ok: false, message };
  }

  report("confirming", { txHash });
  try {
    const confirmation = await confirmTransaction(txHash);
    if (confirmation.status === "FAILED") {
      report("failed", { txHash, message: confirmation.message });
      return { ok: false, message: confirmation.message };
    }
  } catch (error) {
    const message = error instanceof SorobanError ? error.message : errorMessage(error);
    report("failed", { txHash, message });
    return { ok: false, message };
  }

  report("recording", { txHash });
  const recorded = await postJson<ProviderDecisionResult>(
    `/api/providers/${encodeURIComponent(provider.id)}/decision`,
    { action, reason, txHash },
  );

  if (!recorded.ok) {
    // The on-chain status change is real and confirmed even though locka-api didn't save the
    // reason — surface that distinction rather than reporting the whole decision as failed.
    const warning = `Confirmed on-chain, but the note wasn't saved: ${recorded.message}`;
    report("confirmed", { txHash, message: warning });
    return {
      ok: true,
      provider: { ...provider, status: DECISION_COPY[action].resultingStatus },
      txHash,
      warning,
    };
  }

  report("confirmed", { txHash });
  return { ok: true, provider: recorded.data.provider, txHash };
}

export interface BulkDecisionProgress {
  index: number;
  total: number;
  provider: ProviderApplication;
  progress: DecisionProgress;
}

/**
 * Runs a decision across several providers, one at a time. Soroban only allows a single
 * contract invocation per transaction, so there's no way to batch these into one signature —
 * each provider gets its own build/sign/submit/confirm cycle, meaning the admin approves each
 * one in Freighter in turn. `onItemProgress` drives the live per-row status in the bulk modal.
 */
export async function runBulkDecision(
  providers: ProviderApplication[],
  action: DecisionAction,
  reason: string | undefined,
  wallet: FreighterWallet,
  onItemProgress?: (update: BulkDecisionProgress) => void,
): Promise<BulkDecisionResult[]> {
  const results: BulkDecisionResult[] = [];

  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    const outcome = await submitOnChainDecision(provider, action, reason, wallet, (progress) => {
      onItemProgress?.({ index, total: providers.length, provider, progress });
    });

    results.push(
      outcome.ok
        ? {
            id: provider.id,
            name: provider.name,
            ok: true,
            txHash: outcome.txHash,
            message: outcome.warning,
          }
        : { id: provider.id, name: provider.name, ok: false, message: outcome.message },
    );
  }

  return results;
}

export function submitStaffRevocation(
  providerId: string,
  staffId: string,
  reason?: string,
): Promise<ApiResult<ProviderStaffRevocationResult>> {
  return postJson<ProviderStaffRevocationResult>(
    `/api/providers/${encodeURIComponent(providerId)}/staff/${encodeURIComponent(staffId)}/revoke`,
    { reason },
  );
}
