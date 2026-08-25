import { requireStaff } from "@/server/auth/requireStaff";
import { getOrganizationSettings } from "@/server/settings/organization";
import { AdminNav } from "@/components/admin/admin-nav";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const staff = await requireStaff();
  const organization = await getOrganizationSettings();

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-zinc-950">
            {organization?.name ?? "MediSlot"} Admin
          </p>
          <p className="text-xs text-zinc-500">
            {staff.email ?? "Staff"} · {staff.role}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-100"
          >
            Sign out
          </button>
        </form>
      </header>
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
