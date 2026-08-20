"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge, Button, Modal, Textarea, toast } from "@/components/ui";
import { useWallet } from "@/features/auth/WalletContext";
import { runBulkDecision, type BulkDecisionProgress, type DecisionProgress } from "./decisions";
import { TransactionStatus } from "./TransactionStatus";
import { WalletConnectPrompt } from "./WalletConnectPrompt";
import { DECISION_COPY, type DecisionAction } from "./status";
import type { BulkDecisionResult, ProviderApplication } from "./types";

export interface BulkDecisionModalProps {
  /** `null` closes the modal. */
  action: DecisionAction | null;
  providers: ProviderApplication[];
  onClose: () => void;
  /** Called once the admin dismisses the result summary, with every item's outcome. */
  onCompleted: (results: BulkDecisionResult[]) => void;
}

const PREVIEW_LIMIT = 5;

type Stage = "confirm" | "running" | "results";

/**
 * Rendered with `key={action}` by its caller, so opening a new bulk action always mounts a
 * fresh instance instead of carrying over the previous action's reason/error/progress state.
 */
export function BulkDecisionModal({
  action,
  providers,
  onClose,
  onCompleted,
}: BulkDecisionModalProps) {
  const wallet = useWallet();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("confirm");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState<DecisionProgress>({ phase: "idle" });
  const [results, setResults] = useState<BulkDecisionResult[]>([]);
  const nameById = useMemo(
    () => new Map(providers.map((provider) => [provider.id, provider.name])),
    [providers],
  );

  if (!action) return null;

  const copy = DECISION_COPY[action];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;

    const trimmedReason = reason.trim();
    if (copy.requiresReason && !trimmedReason) {
      setError(`A ${copy.label.toLowerCase()} reason is required`);
      return;
    }
    if (!wallet.publicKey) {
      setError("Connect your Freighter wallet to submit these decisions on-chain.");
      return;
    }

    setError(null);
    setStage("running");

    const outcome = await runBulkDecision(
      providers,
      action,
      trimmedReason || undefined,
      wallet,
      (update: BulkDecisionProgress) => {
        setCurrentIndex(update.index);
        setCurrentProgress(update.progress);
      },
    );

    setResults(outcome);
    setStage("results");

    const succeeded = outcome.filter((entry) => entry.ok).length;
    const failed = outcome.length - succeeded;

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
    onCompleted(results);
  }

  if (stage === "running") {
    const current = providers[currentIndex];
    return (
      // Dismissal is intentionally disabled here: closing mid-loop would leave some
      // applications decided and others not, with no way to resume or cancel cleanly.
      <Modal open onClose={() => undefined} title={`${copy.label} in progress…`}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground/70">
            Application {currentIndex + 1} of {providers.length} — confirm each request in Freighter
            as it appears. Don&apos;t close this window.
          </p>
          <p className="truncate text-sm font-medium text-foreground">{current?.name}</p>
          <TransactionStatus progress={currentProgress} />
        </div>
      </Modal>
    );
  }

  if (stage === "results") {
    const failures = results.filter((entry) => !entry.ok);
    // Confirmed on-chain, but the off-chain reason/note failed to save — not a failure, but
    // worth the admin's attention rather than blending in with a clean success.
    const warnings = results.filter((entry) => entry.ok && entry.message);
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

          {(failures.length > 0 || warnings.length > 0) && (
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
              {warnings.map((warning) => (
                <li
                  key={warning.id}
                  className="rounded-lg border border-brand-amber/25 bg-brand-amber/5 px-3 py-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    {warning.name ?? nameById.get(warning.id) ?? warning.id}
                  </p>
                  <p className="text-xs text-foreground/60">{warning.message}</p>
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
            Soroban only allows one contract call per transaction, so each application is signed and
            submitted separately — you&apos;ll confirm each one in Freighter in turn. If one fails,
            the rest still go through and you get a per-application summary.
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

        <WalletConnectPrompt wallet={wallet} subject="these decisions" />

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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={copy.buttonVariant} disabled={!wallet.publicKey}>
            {copy.label} {providers.length}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
