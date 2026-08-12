"use client";

import { useState, type FormEvent } from "react";
import { Button, Modal, Textarea, toast } from "@/components/ui";
import { useWallet } from "@/features/auth/WalletContext";
import { submitOnChainDecision, type DecisionProgress } from "./decisions";
import { TransactionStatus } from "./TransactionStatus";
import { WalletConnectPrompt } from "./WalletConnectPrompt";
import {
  DECISION_COPY,
  PROVIDER_STATUS_LABEL,
  decisionLabel,
  decisionSuccessMessage,
  type DecisionAction,
} from "./status";
import type { ProviderApplication } from "./types";

export interface DecisionModalProps {
  provider: ProviderApplication;
  /** `null` closes the modal; the action also decides the copy and whether a reason is required. */
  action: DecisionAction | null;
  onClose: () => void;
  onDecided: (txHash: string) => void;
}

const IDLE_PROGRESS: DecisionProgress = { phase: "idle" };

/**
 * Rendered with `key={action}` by its caller, so opening a new action always mounts a fresh
 * instance instead of carrying over the previous action's reason/error/progress state.
 */
export function DecisionModal({ provider, action, onClose, onDecided }: DecisionModalProps) {
  const wallet = useWallet();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DecisionProgress>(IDLE_PROGRESS);

  if (!action) return null;

  const copy = DECISION_COPY[action];
  const label = decisionLabel(action, provider.status);
  const submitting = progress.phase !== "idle" && progress.phase !== "failed";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;

    const trimmedReason = reason.trim();
    if (copy.requiresReason && !trimmedReason) {
      setError(`A ${label.toLowerCase()} reason is required`);
      return;
    }

    setError(null);
    setProgress({ phase: "building" });

    const outcome = await submitOnChainDecision(
      provider,
      action,
      trimmedReason || undefined,
      wallet,
      setProgress,
    );

    if (!outcome.ok) {
      toast.error(outcome.message, { title: `${label} failed` });
      return;
    }

    if (outcome.warning) {
      // The on-chain write is real and confirmed, but recording the reason didn't stick — this
      // needs the admin's attention, so it isn't reported as a clean success.
      toast.error(outcome.warning, { title: "Confirmed, but the note wasn't saved" });
    } else {
      toast.success(`${provider.name} is now ${PROVIDER_STATUS_LABEL[copy.resultingStatus]}`, {
        title: decisionSuccessMessage(action, provider.status),
        txHash: outcome.txHash,
      });
    }
    onDecided(outcome.txHash);
  }

  return (
    <Modal open onClose={onClose} title={`${label} ${provider.name}?`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-foreground/70">
          This records the provider as{" "}
          <span className="font-medium text-foreground">
            {PROVIDER_STATUS_LABEL[copy.resultingStatus]}
          </span>{" "}
          in the ProviderRegistry contract. You&apos;ll be asked to sign the transaction in
          Freighter.
          {action === "reject" && " The provider can fix the issues you list and reapply."}
          {action === "suspend" && " Access can be restored later by reinstating the provider."}
          {action === "revoke" && " This is permanent and cannot be undone from this screen."}
        </p>

        <WalletConnectPrompt wallet={wallet} subject="this decision" />

        <Textarea
          label={copy.reasonLabel}
          placeholder={copy.reasonPlaceholder}
          required={copy.requiresReason}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={error ?? undefined}
          disabled={submitting}
          rows={3}
        />

        <TransactionStatus progress={progress} />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={copy.buttonVariant}
            loading={submitting}
            disabled={!wallet.publicKey}
          >
            {label}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
