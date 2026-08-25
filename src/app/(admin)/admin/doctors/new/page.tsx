import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listServices } from "@/server/catalog/services";
import { DoctorForm } from "../doctor-form";

export const dynamic = "force-dynamic";

export default async function NewDoctorPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const [departments, services] = await Promise.all([
    listDepartments(),
    listServices(),
  ]);

  return (
    <main className="px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-950">
        New doctor
      </h1>
      {canManage ? (
        <DoctorForm
          departments={departments}
          services={services}
          readOnly={false}
        />
      ) : (
        <p className="text-sm text-zinc-600">
          Only owners and admins can add doctors.
        </p>
      )}
    </main>
  );
}
