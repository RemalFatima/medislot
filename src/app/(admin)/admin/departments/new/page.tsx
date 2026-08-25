import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { DepartmentForm } from "../department-form";

export const dynamic = "force-dynamic";

export default async function NewDepartmentPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);

  return (
    <main className="px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-950">
        New department
      </h1>
      {canManage ? (
        <DepartmentForm readOnly={false} />
      ) : (
        <p className="text-sm text-zinc-600">
          Only owners and admins can add departments.
        </p>
      )}
    </main>
  );
}
