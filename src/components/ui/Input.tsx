import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper, describedByFor, fieldBaseClasses, fieldStateClasses } from "./field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, required, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <FieldWrapper
        id={inputId}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
      >
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={describedByFor(inputId, error, helperText)}
          className={cn(fieldBaseClasses, fieldStateClasses(!!error), className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

Input.displayName = "Input";
