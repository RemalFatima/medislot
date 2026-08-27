"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CalendarOff,
  LayoutDashboard,
  Settings,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Care",
    items: [
      { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
      { href: "/admin/departments", label: "Departments", icon: Building2 },
      { href: "/admin/services", label: "Services", icon: ClipboardList },
    ],
  },
  {
    label: "Clinic",
    items: [
      { href: "/admin/holidays", label: "Holidays", icon: CalendarOff },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-6 px-3 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {group.label}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)",
                      active
                        ? "bg-accent font-medium text-primary"
                        : "text-foreground/80 hover:bg-surface-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
