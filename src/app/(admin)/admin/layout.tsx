import { requireStaff } from "@/server/auth/requireStaff";
import { getOrganizationSettings } from "@/server/settings/organization";
import { AdminShell } from "@/components/admin/admin-shell";
import { APP_NAME } from "@/lib/brand";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const staff = await requireStaff();
  const organization = await getOrganizationSettings();

  return (
    <AdminShell
      organizationName={APP_NAME}
      logoUrl={organization?.logo_url ?? null}
      staffEmail={staff.email ?? null}
      staffRole={staff.role}
      logoutAction={logoutAction}
    >
      {children}
    </AdminShell>
  );
}
