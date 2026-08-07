import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

const VARIANTS = {
  primary: "bg-brand-blue text-white hover:glow-blue focus-visible:glow-blue",
  secondary:
    "bg-navy-700/60 text-foreground border border-white/10 hover:bg-navy-600/70 focus-visible:border-white/20",
  success: "bg-brand-green text-navy-950 hover:glow-green focus-visible:glow-green",
  danger:
    "bg-brand-red text-white hover:shadow-[0_0_0_1px_rgba(239,68,68,0.4),0_0_24px_rgba(239,68,68,0.35)]",
  amber:
    "bg-brand-amber text-navy-950 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.4),0_0_24px_rgba(245,158,11,0.35)]",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading = false, disabled, className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium",
          "transition-all duration-150 ease-out",
          "hover:-translate-y-0.5 active:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900",
          "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {loading && <Spinner size={size === "lg" ? "md" : "sm"} className="text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
