import Link from "next/link";
import { getPublicOrganization } from "@/server/tenant/getPublicOrganization";

const links = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/doctors", label: "Doctors" },
];

export async function SiteHeader() {
  const organization = await getPublicOrganization();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
          {organization?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.logo_url}
              alt=""
              className="h-8 w-8 rounded object-cover"
            />
          ) : null}
          {organization?.name ?? "MediSlot"}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-700">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-zinc-950">
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
          >
            Staff sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
