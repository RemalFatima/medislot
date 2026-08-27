import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";

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
    <form action={action} method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="min-w-0 flex-1">
        <span className="sr-only">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={query ?? ""}
          placeholder={placeholder}
          className={fieldClass}
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className={buttonClass({ variant: "secondary", className: "flex-1 sm:flex-none" })}>
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
