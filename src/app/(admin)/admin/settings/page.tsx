import { notFound } from "next/navigation";
import { CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { getOrganizationSettings } from "@/server/settings/organization";
import { listTimeZones } from "@/server/settings/timezones";
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

  const canManage = canManageCatalog(staff.role);

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Clinic"
        title="Clinic settings"
        description="Name, branding, contact, timezone, and whether the public site is visible."
      />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <OrganizationSettingsForm
          organization={organization}
          timezones={zones}
          readOnly={!canManage}
        />
      </div>
    </main>
  );
}
