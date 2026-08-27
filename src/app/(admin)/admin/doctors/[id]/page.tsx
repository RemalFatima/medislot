import { notFound } from "next/navigation";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { getDoctorById } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { listDoctorAvailability } from "@/server/scheduling/availability";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DoctorForm } from "../doctor-form";
import { WeeklyHoursForm } from "../weekly-hours-form";

export const dynamic = "force-dynamic";

export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();
  const { id } = await params;
  const [doctor, departments, services, windows, timezone] = await Promise.all([
    getDoctorById(id),
    listDepartments(),
    listServices(),
    listDoctorAvailability(id),
    getOrganizationTimezone(),
  ]);

  if (!doctor) {
    notFound();
  }

  const canManage = canManageCatalog(staff.role);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { href: "/admin/doctors", label: "Doctors" },
          { label: doctor.full_name },
        ]}
      />
      <PageHeader
        title={doctor.full_name}
        description="Profile, departments, services, and weekly hours. Uncheck Active to hide the public profile."
        actions={<VisibilityBadge active={doctor.is_active} />}
      />
      <DoctorForm
        doctor={doctor}
        departments={departments}
        services={services}
        readOnly={!canManage}
      />
      <WeeklyHoursForm
        key={windows.map((window) => window.id).join()}
        doctorId={doctor.id}
        windows={windows}
        timezone={timezone}
        readOnly={!canManage}
      />
    </main>
  );
}
