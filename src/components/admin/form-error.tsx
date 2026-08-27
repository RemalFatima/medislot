import { cn } from "@/lib/cn";
import { humanErrorMessage } from "@/lib/human-error";

export function FormError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger",
        className,
      )}
      role="alert"
    >
      {humanErrorMessage(message)}
    </p>
  );
}
