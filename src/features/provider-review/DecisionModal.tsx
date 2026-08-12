"use client";

import { useState, type FormEvent } from "react";
import { Button, Modal, Textarea, toast } from "@/components/ui";
import { submitDecision, withPendingToast } from "./decisions";
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
  onDecided: () => void;
}

/**
 * Rendered with `key={action}` by its caller, so opening a new action always mounts a fresh
 * instance instead of carrying over the previous action's reason/error/loading state.
 */
export function DecisionModal({ provider, action, onClose, onDecided }: DecisionModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!action) return null;

  const copy = DECISION_COPY[action];
  const label = decisionLabel(action, provider.status);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;

    const trimmedReason = reason.trim();
    if (copy.requiresReason && !trimmedReason) {
      setError(`A ${label.toLowerCase()} reason is required`);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await withPendingToast(copy.pendingMessage, () =>
      submitDecision(provider.id, action, trimmedReason || undefined),
    );

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      toast.error(result.message, { title: `${label} failed` });
      return;
    }

    toast.success(`${provider.name} is now ${PROVIDER_STATUS_LABEL[copy.resultingStatus]}`, {
      title: decisionSuccessMessage(action, provider.status),
      txHash: result.data.txHash,
    });
    onDecided();
  }

  return (
    <Modal open onClose={onClose} title={`${label} ${provider.name}?`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-foreground/70">
          This records the provider as{" "}
          <span className="font-medium text-foreground">
            {PROVIDER_STATUS_LABEL[copy.resultingStatus]}
          </span>{" "}
          in the ProviderRegistry contract.
          {action === "reject" && " The provider can fix the issues you list and reapply."}
          {action === "suspend" && " Access can be restored later by reinstating the provider."}
          {action === "revoke" && " This is permanent and cannot be undone from this screen."}
        </p>

        <Textarea
          label={copy.reasonLabel}
          placeholder={copy.reasonPlaceholder}
          required={copy.requiresReason}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={error ?? undefined}
          rows={3}
        />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant={copy.buttonVariant} loading={loading}>
            {label}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
