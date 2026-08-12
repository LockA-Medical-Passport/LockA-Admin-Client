"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { SorobanError, errorMessage } from "@/lib/soroban/errors";
import { getProviderStatus } from "@/lib/soroban/provider-registry";
import { ProviderStatusBadge } from "./ProviderStatusBadge";
import type { ProviderStatus } from "./types";

type VerifyState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; status: ProviderStatus | null }
  | { phase: "error"; message: string };

/**
 * Reads the provider's status directly from `ProviderRegistry` over Soroban RPC, on demand —
 * independent of locka-api's indexed cache. Lets an admin cross-check the "On-chain status"
 * panel against the chain itself, which is also the quickest way to tell a slow indexer
 * (still catching up) apart from a genuinely stuck transaction.
 */
export function VerifyOnChainStatus({ walletAddress }: { walletAddress: string }) {
  const [state, setState] = useState<VerifyState>({ phase: "idle" });

  async function handleVerify() {
    setState({ phase: "loading" });
    try {
      const status = await getProviderStatus(walletAddress);
      setState({ phase: "done", status });
    } catch (error) {
      setState({
        phase: "error",
        message: error instanceof SorobanError ? error.message : errorMessage(error),
      });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleVerify}
        loading={state.phase === "loading"}
      >
        Verify on-chain
      </Button>

      {state.phase === "done" && (
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <span>Live read from ProviderRegistry:</span>
          {state.status ? (
            <ProviderStatusBadge status={state.status} />
          ) : (
            <span>not registered on-chain</span>
          )}
        </div>
      )}

      {state.phase === "error" && <p className="text-xs text-brand-red">{state.message}</p>}
    </div>
  );
}
