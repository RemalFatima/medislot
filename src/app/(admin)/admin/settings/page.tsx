import { notFound } from "next/navigation";
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

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Clinic settings
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Public name, timezone, and branding. Slug stays {organization.slug}.
      </p>
      <OrganizationSettingsForm
        organization={organization}
        timezones={zones}
        readOnly={!canManageCatalog(staff.role)}
      />
    </main>
  );
}
