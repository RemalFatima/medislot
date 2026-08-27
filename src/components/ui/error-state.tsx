import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function ErrorState({
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
    <div className={cn("mx-auto w-full max-w-lg px-4 py-16 text-center", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function RetryButton({
  onClick,
  label = "Try again",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button type="button" onClick={onClick} className="w-full sm:w-auto">
      {label}
    </Button>
  );
}

export function retryHandler(retry?: () => void, reset?: () => void) {
  return () => {
    (retry ?? reset)?.();
  };
}
