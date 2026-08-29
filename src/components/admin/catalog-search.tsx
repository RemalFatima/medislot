import Link from "next/link";
import { Search } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export function CatalogSearch({
  action,
  query,
  placeholder,
}: {
  action: string;
  query?: string;
  placeholder: string;
}) {
  return (
    <form
      action={action}
      method="get"
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <label className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-border bg-surface px-3 text-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-(--ring)">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <span className="sr-only">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={query ?? ""}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className={buttonClass({ variant: "secondary", className: "flex-1 sm:flex-none" })}
        >
          Search
        </button>
        {query ? (
          <Link href={action} className={buttonClass({ variant: "ghost", className: "flex-1 sm:flex-none" })}>
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
