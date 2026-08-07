import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  green: "bg-brand-green/15 text-brand-green border-brand-green/30",
  amber: "bg-brand-amber/15 text-brand-amber border-brand-amber/30",
  red: "bg-brand-red/15 text-brand-red border-brand-red/30",
  cyan: "bg-locka-cyan/15 text-locka-cyan border-locka-cyan/30",
  gray: "bg-white/10 text-foreground/70 border-white/15",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "gray", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
