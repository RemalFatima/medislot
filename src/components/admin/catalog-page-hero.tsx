import type { ReactNode } from "react";

export function CatalogPageHero({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-accent">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {breadcrumb}
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          {eyebrow}
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className="wrap-break-word text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function CatalogFormCard({
  children,
  kicker,
}: {
  children: ReactNode;
  kicker?: string;
}) {
  return (
    <div className="max-w-2xl overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-card)">
      <div className="h-1.5 bg-primary" />
      <div className="bg-linear-to-b from-accent/40 to-surface p-5 sm:p-6">
        {kicker ? (
          <p className="mb-4 text-xs font-semibold tracking-wider text-primary uppercase">
            {kicker}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
