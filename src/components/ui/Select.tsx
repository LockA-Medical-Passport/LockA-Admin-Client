import { type SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper, describedByFor, fieldBaseClasses, fieldStateClasses } from "./field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, helperText, error, required, id, className, options, placeholder, children, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <FieldWrapper
        id={selectId}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
      >
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={!!error || undefined}
            aria-describedby={describedByFor(selectId, error, helperText)}
            className={cn(
              fieldBaseClasses,
              "appearance-none pr-9",
              fieldStateClasses(!!error),
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-foreground/50"
          >
            <path
              d="M5.5 7.5 10 12l4.5-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </FieldWrapper>
    );
  },
);

Select.displayName = "Select";
