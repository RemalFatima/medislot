"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/departments", label: "Departments" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/holidays", label: "Holidays" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-zinc-200 bg-white px-6">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 px-3 py-2 text-sm ${
              active
                ? "border-zinc-900 font-medium text-zinc-950"
                : "border-transparent text-zinc-600 hover:text-zinc-950"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
