"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/doctors", label: "Doctors" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-foreground"
          onClick={() => setOpen(false)}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="size-8 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-semibold text-primary">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="truncate">{name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/login" className={buttonClass({ size: "sm", className: "ml-2" })}>
            Staff sign in
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg text-foreground hover:bg-surface-muted md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </Container>

      {open ? (
        <div id={menuId} className="border-t border-border bg-surface md:hidden">
          <Container>
            <nav className="flex flex-col gap-1 py-3" aria-label="Primary">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm",
                      active
                        ? "bg-accent font-medium text-primary"
                        : "text-foreground hover:bg-surface-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={buttonClass({ className: "mt-2 w-full" })}
              >
                Staff sign in
              </Link>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
