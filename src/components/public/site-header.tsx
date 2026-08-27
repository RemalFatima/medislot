"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { APP_LOGO } from "@/lib/brand";
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
}: {
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const [menuPath, setMenuPath] = useState(pathname);

  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setOpen(false);
  }

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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 shadow-[0_1px_0_rgb(18_32_43/0.04),0_8px_24px_rgb(18_32_43/0.04)] backdrop-blur-md">
      <div className="h-0.5 bg-primary" />
      <Container className="flex h-21 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-base font-semibold text-foreground"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={APP_LOGO}
            alt={name}
            className="h-14 w-auto max-w-[16rem] shrink-0 object-contain object-left sm:h-16 sm:max-w-[20rem]"
          />
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
                  "rounded-lg px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)",
                  active
                    ? "font-medium text-primary underline decoration-primary decoration-2 underline-offset-8"
                    : "text-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className={buttonClass({
              size: "sm",
              className: "ml-2",
            })}
          >
            Staff sign in
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="true"
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
                      "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)",
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
                className={buttonClass({
                  className: "mt-2 w-full",
                })}
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
