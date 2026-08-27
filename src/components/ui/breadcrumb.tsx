import Link from "next/link";

export function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-x-2"
            >
              {index > 0 ? <span aria-hidden>/</span> : null}
              {last || !item.href ? (
                <span
                  className="truncate text-foreground"
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
