"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function SidebarBrand({
  organizationName,
  logoUrl,
}: {
  organizationName: string;
  logoUrl: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className="size-8 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-semibold text-primary">
          {organizationName.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{organizationName}</p>
        <p className="truncate text-xs text-muted">Staff console</p>
      </div>
    </div>
  );
}

function SidebarAccount({
  staffEmail,
  staffRole,
  logoutAction,
}: {
  staffEmail: string | null;
  staffRole: string;
  logoutAction: () => Promise<void>;
}) {
  return (
    <div className="mt-auto border-t border-border p-4">
      <p className="truncate text-sm font-medium">{staffEmail ?? "Staff"}</p>
      <p className="mt-0.5 text-xs capitalize text-muted">{staffRole}</p>
      <form action={logoutAction} className="mt-3">
        <Button variant="secondary" size="sm" type="submit" className="w-full">
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </form>
    </div>
  );
}

export function AdminShell({
  organizationName,
  logoUrl,
  staffEmail,
  staffRole,
  logoutAction,
  children,
}: {
  organizationName: string;
  logoUrl: string | null;
  staffEmail: string | null;
  staffRole: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 shrink-0 px-0"
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" aria-hidden />
          <span className="sr-only">Open navigation</span>
        </Button>
        <p className="min-w-0 truncate text-sm font-semibold">{organizationName}</p>
      </header>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          aria-label="Close navigation"
          onClick={close}
        />
      ) : null}

      <aside
        id={drawerId}
        aria-label="Staff navigation"
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-border bg-surface transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4">
          <SidebarBrand organizationName={organizationName} logoUrl={logoUrl} />
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 shrink-0 px-0"
            onClick={close}
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Close navigation</span>
          </Button>
        </div>
        <AdminNav onNavigate={close} />
        <SidebarAccount
          staffEmail={staffEmail}
          staffRole={staffRole}
          logoutAction={logoutAction}
        />
      </aside>

      <aside
        aria-label="Staff navigation"
        className="fixed inset-y-0 left-0 hidden w-72 flex-col overflow-y-auto border-r border-border bg-surface lg:flex"
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <SidebarBrand organizationName={organizationName} logoUrl={logoUrl} />
        </div>
        <AdminNav />
        <SidebarAccount
          staffEmail={staffEmail}
          staffRole={staffRole}
          logoutAction={logoutAction}
        />
      </aside>

      <div className="lg:pl-72">{children}</div>
    </div>
  );
}
