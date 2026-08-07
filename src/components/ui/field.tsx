import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const fieldBaseClasses = cn(
  "w-full rounded-lg border border-white/10 bg-navy-800/60 px-3.5 py-2.5 text-sm text-foreground",
  "placeholder:text-foreground/40",
  "transition-colors duration-150",
  "focus:outline-none focus:ring-2 focus:ring-locka-cyan/50 focus:border-locka-cyan/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export function fieldStateClasses(hasError: boolean) {
  return hasError && "border-brand-red/60 focus:ring-brand-red/50 focus:border-brand-red/60";
}

export function describedByFor(id: string, error?: string, helperText?: string) {
  if (error) return `${id}-error`;
  if (helperText) return `${id}-helper`;
  return undefined;
}

export interface FieldWrapperProps {
  id: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FieldWrapper({
  id,
  label,
  helperText,
  error,
  required,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground/90">
          {label}
          {required && (
            <span className="ml-0.5 text-brand-red" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-brand-red">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-xs text-foreground/50">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
