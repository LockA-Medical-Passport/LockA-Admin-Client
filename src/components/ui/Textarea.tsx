import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper, describedByFor, fieldBaseClasses, fieldStateClasses } from "./field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, required, id, className, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <FieldWrapper
        id={textareaId}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={describedByFor(textareaId, error, helperText)}
          className={cn(fieldBaseClasses, "resize-y", fieldStateClasses(!!error), className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

Textarea.displayName = "Textarea";
