import Link from "next/link";
import { Building2 } from "lucide-react";
import { CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { CatalogPreviewCard } from "@/components/admin/catalog-preview";
import { CatalogSearch } from "@/components/admin/catalog-search";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { buttonClass } from "@/components/ui/button";
import { Card, cardGridHoverClass } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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
  const countLabel =
    visible.length === 1 ? "1 department" : `${visible.length} departments`;

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Catalog"
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

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden p-0">
          <div className="h-1.5 bg-primary" />
          <div className="bg-linear-to-b from-accent/30 to-surface p-4 sm:p-5">
            <CatalogSearch
              action="/admin/departments"
              query={query}
              placeholder="Search departments"
            />
          </div>
        </Card>

        {visible.length === 0 ? (
          <EmptyState
            className="mt-8"
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
          <>
            <p className="mt-8 mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <Building2 className="size-4 text-primary" aria-hidden />
              {countLabel}
            </p>
            <ul className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${cardGridHoverClass}`}>
              {visible.map((department) => {
                const count = doctorCounts.get(department.id) ?? 0;
                return (
                  <li key={department.id}>
                    <CatalogPreviewCard
                      title={department.name}
                      description={department.description}
                      meta={count === 1 ? "1 doctor" : `${count} doctors`}
                      active={department.is_active}
                      editHref={`/admin/departments/${department.id}`}
                      canEdit={canManage}
                      fields={[
                        { label: "Name", value: department.name },
                        { label: "Description", value: department.description ?? "" },
                        { label: "Display order", value: String(department.sort_order) },
                        {
                          label: "Doctors",
                          value: count === 1 ? "1 doctor" : `${count} doctors`,
                        },
                        { label: "Status", value: department.is_active ? "Active" : "Hidden" },
                      ]}
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
