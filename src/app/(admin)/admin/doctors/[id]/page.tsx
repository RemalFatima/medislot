import { notFound } from "next/navigation";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { getDoctorById } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { DoctorForm } from "../doctor-form";

export const dynamic = "force-dynamic";

export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();
  const { id } = await params;
  const [doctor, departments, services] = await Promise.all([
    getDoctorById(id),
    listDepartments(),
    listServices(),
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
    </main>
  );
}
