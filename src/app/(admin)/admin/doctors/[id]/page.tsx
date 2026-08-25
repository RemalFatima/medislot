import { notFound } from "next/navigation";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { getDoctorById } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { listDoctorAvailability } from "@/server/scheduling/availability";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
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

  return (
    <main className="px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-950">
        {doctor.full_name}
      </h1>
      <DoctorForm
        doctor={doctor}
        departments={departments}
        services={services}
        readOnly={!canManageCatalog(staff.role)}
      />
      <WeeklyHoursForm
        key={windows.map((window) => window.id).join()}
        doctorId={doctor.id}
        windows={windows}
        timezone={timezone}
        readOnly={!canManageCatalog(staff.role)}
      />
    </main>
  );
}
