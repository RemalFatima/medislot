import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
        <span className="sr-only">Loading</span>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-8 h-11 w-full" />
        <Skeleton className="mt-4 h-11 w-full" />
        <Skeleton className="mt-4 h-11 w-full" />
      </div>
    </main>
  );
}
