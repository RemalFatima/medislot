import { notFound } from "next/navigation";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { getOrganizationSettings } from "@/server/settings/organization";
import { listTimeZones } from "@/server/settings/timezones";
import { PageHeader } from "@/components/ui/page-header";
import { OrganizationSettingsForm } from "./organization-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const staff = await requireStaff();
  const organization = await getOrganizationSettings();

  if (!organization) {
    notFound();
  }

  const zones = listTimeZones();
  if (!zones.includes(organization.timezone)) {
    zones.unshift(organization.timezone);
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Clinic settings"
        description="Name, branding, contact, timezone, and whether the public site is visible."
      />
      <OrganizationSettingsForm
        organization={organization}
        timezones={zones}
        readOnly={!canManageCatalog(staff.role)}
      />
    </main>
  );
}
