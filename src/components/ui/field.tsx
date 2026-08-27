import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { humanErrorMessage } from "@/lib/human-error";

export const fieldClass = cn(
  "h-11 w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
  "outline-none transition-colors placeholder:text-muted",
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
);

export const checkboxClass =
  "size-4 shrink-0 rounded border-border text-primary accent-primary focus-visible:ring-2 focus-visible:ring-(--ring) disabled:opacity-60";

export const textareaClass = cn(
  "w-full min-w-0 max-w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground",
  "outline-none transition-colors placeholder:text-muted",
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
);

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint && !error ? <span className="text-xs text-muted">{hint}</span> : null}
      {error ? (
        <span className="text-xs text-danger" role="alert">
          {humanErrorMessage(error)}
        </span>
      ) : null}
    </label>
  );
}
