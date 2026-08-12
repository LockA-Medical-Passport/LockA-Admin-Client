import { Badge, EmptyState } from "@/components/ui";
import { shortTxHash, stellarTxUrl } from "@/lib/stellar";
import { formatDateTime } from "./format";
import { HISTORY_ACTION_LABEL, HISTORY_ACTION_VARIANT } from "./status";
import type { ProviderHistoryEntry } from "./types";

/**
 * The provider's audit trail: submitted -> approved/rejected -> suspended/revoked, oldest
 * first, sourced from the same audit log the global Audit Log view reads.
 */
export function StatusTimeline({ entries }: { entries: ProviderHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No history yet"
        description="Decisions recorded against this provider will appear here."
      />
    );
  }

  const ordered = [...entries].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  return (
    <ol className="flex flex-col">
      {ordered.map((entry, index) => (
        <li key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-locka-cyan"
              aria-hidden="true"
            />
            {index < ordered.length - 1 && <span className="w-px flex-1 bg-white/10" />}
          </div>

          <div
            className={
              index < ordered.length - 1 ? "flex flex-col gap-1 pb-5" : "flex flex-col gap-1"
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={HISTORY_ACTION_VARIANT[entry.action]}>
                {HISTORY_ACTION_LABEL[entry.action]}
              </Badge>
              <span className="text-xs text-foreground/50">{formatDateTime(entry.occurredAt)}</span>
            </div>

            <p className="text-sm text-foreground/70">
              {entry.actorName || entry.actorEmail || "System"}
              {entry.actorName && entry.actorEmail && (
                <span className="text-foreground/40"> · {entry.actorEmail}</span>
              )}
            </p>

            {entry.note && <p className="text-sm text-foreground/80">{entry.note}</p>}

            {entry.txHash && (
              <a
                href={stellarTxUrl(entry.txHash)}
                target="_blank"
                rel="noreferrer"
                className="w-fit rounded font-mono text-xs text-locka-cyan hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
              >
                {shortTxHash(entry.txHash)}
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
