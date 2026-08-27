import { requireStaff } from "@/server/auth/requireStaff";
import { AdminShell } from "@/components/admin/admin-shell";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const staff = await requireStaff();

  return (
    <AdminShell
      staffEmail={staff.email ?? null}
      staffRole={staff.role}
      logoutAction={logoutAction}
    >
      {children}
    </AdminShell>
  );
}
