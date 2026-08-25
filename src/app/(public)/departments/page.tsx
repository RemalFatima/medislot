import Link from "next/link";
import { listDepartments } from "@/server/catalog/departments";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const departments = await listDepartments({ activeOnly: true });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Departments
      </h1>
      {departments.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">
          No departments are available yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {departments.map((department) => (
            <li key={department.id}>
              <Link
                href={`/departments/${department.slug}`}
                className="block rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400"
              >
                <p className="font-medium text-zinc-950">{department.name}</p>
                {department.description ? (
                  <p className="mt-2 text-sm text-zinc-600">
                    {department.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
