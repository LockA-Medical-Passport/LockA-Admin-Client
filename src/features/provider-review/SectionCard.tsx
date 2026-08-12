import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EMPTY_VALUE } from "./format";

export interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, action, className, children }: SectionCardProps) {
  return (
    <section className={cn("glass flex flex-col gap-4 rounded-xl p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-foreground/50">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export interface DetailFieldProps {
  label: string;
  value?: ReactNode;
  /** Renders the value in the mono font — for hashes, wallet addresses and license numbers. */
  mono?: boolean;
  /** Set on the value element — for a truncated hash/address, pass the untruncated string. */
  title?: string;
  className?: string;
}

/**
 * Emptiness is judged on `value` alone, so callers must pass `undefined` (not a wrapper
 * element that itself renders null) for a missing value — otherwise this renders a blank row
 * instead of the "—" placeholder.
 */
export function DetailField({ label, value, mono, title, className }: DetailFieldProps) {
  const isEmpty = value === undefined || value === null || value === "";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-xs font-medium tracking-wide text-foreground/50 uppercase">{label}</dt>
      <dd
        title={title}
        className={cn(
          "text-sm break-words",
          mono && "font-mono text-[13px]",
          isEmpty ? "text-foreground/40" : "text-foreground",
        )}
      >
        {isEmpty ? EMPTY_VALUE : value}
      </dd>
    </div>
  );
}
