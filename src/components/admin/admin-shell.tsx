"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/cn";

function SidebarBrand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={APP_LOGO}
        alt={APP_NAME}
        className="h-12 w-auto max-w-[15rem] shrink-0 object-contain object-left"
      />
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

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function AdminShell({
  staffEmail,
  staffRole,
  logoutAction,
  children,
}: {
  staffEmail: string | null;
  staffRole: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        openButtonRef.current?.focus();
        wasOpen.current = false;
      }
      return;
    }

    wasOpen.current = true;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const nodes = [
        ...drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((node) => !node.hasAttribute("disabled") && node.tabIndex !== -1);

      if (nodes.length === 0) {
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
    <div className="min-h-full min-w-0 bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <Button
          ref={openButtonRef}
          variant="ghost"
          size="sm"
          className="h-11 w-11 shrink-0 px-0"
          aria-expanded={open}
          aria-controls={drawerId}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" aria-hidden />
          <span className="sr-only">Open navigation</span>
        </Button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={APP_LOGO}
          alt={APP_NAME}
          className="h-11 w-auto max-w-[14rem] shrink-0 object-contain object-left"
        />
      </header>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={close}
        />
      ) : null}

      <aside
        ref={drawerRef}
        id={drawerId}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label="Staff navigation"
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-border bg-surface transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4">
          <SidebarBrand />
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="sm"
            className="h-11 w-11 shrink-0 px-0"
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
          <SidebarBrand />
        </div>
        <AdminNav />
        <SidebarAccount
          staffEmail={staffEmail}
          staffRole={staffRole}
          logoutAction={logoutAction}
        />
      </aside>

      <div id="main-content" tabIndex={-1} className="min-w-0 lg:pl-72">
        {children}
      </div>
    </div>
  );
}
