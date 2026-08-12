"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Modal, Textarea, toast } from "@/components/ui";
import { submitBulkDecision, withPendingToast } from "./decisions";
import { DECISION_COPY, type DecisionAction } from "./status";
import type { BulkDecisionResult, ProviderApplication } from "./types";

export interface BulkDecisionModalProps {
  /** `null` closes the modal. */
  action: DecisionAction | null;
  providers: ProviderApplication[];
  onClose: () => void;
  /** Called once the admin dismisses the result summary, so the caller can refresh the queue. */
  onCompleted: () => void;
}

const PREVIEW_LIMIT = 5;

/**
 * Rendered with `key={action}` by its caller, so opening a new bulk action always mounts a
 * fresh instance instead of carrying over the previous action's reason/error/results state.
 */
export function BulkDecisionModal({
  action,
  providers,
  onClose,
  onCompleted,
}: BulkDecisionModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkDecisionResult[] | null>(null);

  if (!action) return null;

  const copy = DECISION_COPY[action];
  const nameById = new Map(providers.map((provider) => [provider.id, provider.name]));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;

    const trimmedReason = reason.trim();
    if (copy.requiresReason && !trimmedReason) {
      setError(`A ${copy.label.toLowerCase()} reason is required`);
      return;
    }

    setLoading(true);
    setError(null);

    const ids = providers.map((provider) => provider.id);
    const result = await withPendingToast(
      `${copy.pendingMessage} (${ids.length} applications)`,
      () => submitBulkDecision(ids, action, trimmedReason || undefined),
    );

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      toast.error(result.message, { title: `Bulk ${copy.label.toLowerCase()} failed` });
      return;
    }

    const succeeded = result.data.results.filter((entry) => entry.ok).length;
    const failed = result.data.results.length - succeeded;
    setResults(result.data.results);

    if (failed === 0) {
      toast.success(`${succeeded} ${succeeded === 1 ? "application" : "applications"} updated`, {
        title: copy.successMessage,
      });
    } else {
      toast.error(`${succeeded} succeeded, ${failed} failed — see the summary for details`, {
        title: `Bulk ${copy.label.toLowerCase()} partially applied`,
      });
    }
  }

  function handleDone() {
    onCompleted();
  }

  if (results) {
    const failures = results.filter((entry) => !entry.ok);
    const succeeded = results.length - failures.length;

    return (
      <Modal
        open
        onClose={handleDone}
        title={`${copy.label} results`}
        footer={<Button onClick={handleDone}>Done</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="green">{succeeded} succeeded</Badge>
            {failures.length > 0 && <Badge variant="red">{failures.length} failed</Badge>}
          </div>

          {failures.length > 0 && (
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {failures.map((failure) => (
                <li
                  key={failure.id}
                  className="rounded-lg border border-brand-red/25 bg-brand-red/5 px-3 py-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    {failure.name ?? nameById.get(failure.id) ?? failure.id}
                  </p>
                  <p className="text-xs text-foreground/60">{failure.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    );
  }

  const preview = providers.slice(0, PREVIEW_LIMIT);

  return (
    <Modal
      open
      onClose={onClose}
      title={`${copy.label} ${providers.length} ${providers.length === 1 ? "application" : "applications"}?`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-foreground/70">
            Each application is submitted separately — if one fails, the rest still go through and
            you get a per-application summary.
          </p>
          <ul className="flex flex-col gap-1 text-sm text-foreground/80">
            {preview.map((provider) => (
              <li key={provider.id} className="truncate">
                {provider.name}
              </li>
            ))}
            {providers.length > preview.length && (
              <li className="text-foreground/50">and {providers.length - preview.length} more</li>
            )}
          </ul>
        </div>

        <Textarea
          label={`${copy.reasonLabel}${copy.requiresReason ? " — applied to all" : ""}`}
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
            {copy.label} {providers.length}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
