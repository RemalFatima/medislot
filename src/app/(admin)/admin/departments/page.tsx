import Link from "next/link";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const departments = await listDepartments();

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Departments
        </h1>
        {canManage ? (
          <Link
            href="/admin/departments/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add department
          </Link>
        ) : null}
      </div>
      {departments.length === 0 ? (
        <p className="text-sm text-zinc-600">No departments yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {departments.map((department) => (
            <li key={department.id}>
              <Link
                href={`/admin/departments/${department.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium text-zinc-950">{department.name}</p>
                  <p className="text-xs text-zinc-500">{department.slug}</p>
                </div>
                <span className="text-xs text-zinc-500">
                  {department.is_active ? "Active" : "Hidden"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
