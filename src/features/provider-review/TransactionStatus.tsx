import { Spinner } from "@/components/ui";
import { shortTxHash, stellarTxUrl } from "@/lib/stellar";
import { cn } from "@/lib/utils";
import type { DecisionPhase, DecisionProgress } from "./decisions";

const PHASE_LABEL: Record<DecisionPhase, string> = {
  idle: "",
  building: "Preparing the transaction…",
  "awaiting-signature": "Confirm the request in Freighter…",
  submitting: "Submitting to the network…",
  confirming: "Waiting for network confirmation…",
  recording: "Saving…",
  confirmed: "Confirmed",
  failed: "Failed",
};

const PHASE_STYLE: Record<"active" | "confirmed" | "warning" | "failed", string> = {
  active: "border-locka-cyan/30 bg-locka-cyan/5 text-locka-cyan",
  confirmed: "border-brand-green/30 bg-brand-green/5 text-brand-green",
  warning: "border-brand-amber/30 bg-brand-amber/5 text-brand-amber",
  failed: "border-brand-red/30 bg-brand-red/5 text-brand-red",
};

/**
 * Visible pending -> confirmed/failed state for an in-flight ProviderRegistry transaction,
 * rendered inline in the decision modals so the admin sees exactly where things are rather
 * than a single opaque spinner for the whole build -> sign -> submit -> confirm sequence.
 */
export function TransactionStatus({ progress }: { progress: DecisionProgress }) {
  if (progress.phase === "idle") return null;

  // "confirmed" with a message means the on-chain write succeeded but a follow-up step (saving
  // the reason to locka-api) didn't — that's not a plain success, so it gets its own styling
  // rather than looking identical to a clean confirmation.
  const variant =
    progress.phase === "confirmed"
      ? progress.message
        ? "warning"
        : "confirmed"
      : progress.phase === "failed"
        ? "failed"
        : "active";

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
        PHASE_STYLE[variant],
      )}
    >
      {variant === "active" ? (
        <Spinner size="sm" className="mt-0.5 shrink-0" />
      ) : (
        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      )}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{PHASE_LABEL[progress.phase]}</span>
        {progress.message && <span className="text-foreground/70">{progress.message}</span>}
        {progress.txHash && (
          <a
            href={stellarTxUrl(progress.txHash)}
            target="_blank"
            rel="noreferrer"
            className="w-fit font-mono text-xs hover:underline"
          >
            {shortTxHash(progress.txHash)}
          </a>
        )}
      </div>
    </div>
  );
}
