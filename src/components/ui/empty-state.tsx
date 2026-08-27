import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center sm:px-6 sm:py-12",
        className,
      )}
      role="status"
    >
      <p className="font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-4 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}
