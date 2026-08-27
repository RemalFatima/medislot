import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export function PageSkeleton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(compact ? "py-6" : "py-10", className)}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <Skeleton className="h-8 w-48 max-w-full" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="mt-4 h-48 w-full" />
    </div>
  );
}
