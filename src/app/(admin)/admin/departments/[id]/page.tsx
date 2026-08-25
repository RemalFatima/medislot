import { notFound } from "next/navigation";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { getDepartmentById } from "@/server/catalog/departments";
import { DepartmentForm } from "../department-form";

export const dynamic = "force-dynamic";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();
  const { id } = await params;
  const department = await getDepartmentById(id);

  if (!department) {
    notFound();
  }

  return (
    <main className="px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-950">
        {department.name}
      </h1>
      <DepartmentForm
        department={department}
        readOnly={!canManageCatalog(staff.role)}
      />
    </main>
  );
}
