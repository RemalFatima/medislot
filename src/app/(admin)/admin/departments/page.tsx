import Link from "next/link";
import { CatalogSearch } from "@/components/admin/catalog-search";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const query = (await searchParams).q?.trim() || undefined;
  const [departments, doctors] = await Promise.all([
    listDepartments(),
    listDoctors(),
  ]);
  const doctorCounts = new Map<string, number>();
  for (const doctor of doctors) {
    const seen = new Set<string>();
    for (const department of doctor.departments) {
      if (seen.has(department.id)) {
        continue;
      }
      seen.add(department.id);
      doctorCounts.set(department.id, (doctorCounts.get(department.id) ?? 0) + 1);
    }
  }

  const visible = query
    ? departments.filter((department) =>
        `${department.name} ${department.slug} ${department.description ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : departments;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Departments"
        description="Organize doctors into care areas for the public catalog."
        actions={
          canManage ? (
            <Link href="/admin/departments/new" className={buttonClass()}>
              Add department
            </Link>
          ) : null
        }
      />

      <Card className="p-4 sm:p-5">
        <CatalogSearch
          action="/admin/departments"
          query={query}
          placeholder="Search departments"
        />
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title={query ? "No departments match this search" : "No departments yet"}
          description={
            query
              ? "Try a different name, or clear the search."
              : "Add a department, then assign doctors to it."
          }
          action={
            query ? (
              <Link href="/admin/departments" className={buttonClass({ variant: "secondary" })}>
                Clear search
              </Link>
            ) : canManage ? (
              <Link href="/admin/departments/new" className={buttonClass({ variant: "secondary" })}>
                Add department
              </Link>
            ) : null
          }
        />
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((department) => {
            const count = doctorCounts.get(department.id) ?? 0;
            return (
              <li key={department.id}>
                <Link href={`/admin/departments/${department.id}`} className="block h-full">
                  <Card className="flex h-full flex-col p-4 transition-colors hover:border-primary/30">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-foreground">{department.name}</p>
                      <VisibilityBadge active={department.is_active} />
                    </div>
                    {department.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {department.description}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-muted">
                      {count === 1 ? "1 doctor" : `${count} doctors`}
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
