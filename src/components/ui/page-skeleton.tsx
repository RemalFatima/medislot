import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={compact ? "px-4 py-6 sm:px-6 lg:px-8" : "px-4 py-10 sm:px-6 lg:px-8"}
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
