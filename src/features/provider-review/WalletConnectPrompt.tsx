"use client";

import { Button } from "@/components/ui";
import type { FreighterWallet } from "@/features/auth/useFreighterWallet";

export interface WalletConnectPromptProps {
  wallet: FreighterWallet;
  /** e.g. "this decision" / "these decisions" — filled into "Connect your wallet to submit {subject} on-chain." */
  subject: string;
}

/** Shown in the decision modals when no Freighter wallet is connected yet, so signing can't proceed. */
export function WalletConnectPrompt({ wallet, subject }: WalletConnectPromptProps) {
  if (wallet.publicKey) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-amber/30 bg-brand-amber/5 px-3 py-2 text-sm text-brand-amber">
      <span>Connect your Freighter wallet to submit {subject} on-chain.</span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={wallet.connect}
        loading={wallet.status === "connecting"}
      >
        Connect
      </Button>
    </div>
  );
}
