import { notFound } from "next/navigation";
import { CatalogFormCard, CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { getDepartmentById } from "@/server/catalog/departments";
import { DepartmentForm } from "../department-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";

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
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Catalog"
        title={department.name}
        description="Uncheck Active to hide this department from the public site. Catalog rows are not deleted."
        actions={<VisibilityBadge active={department.is_active} />}
        breadcrumb={
          <Breadcrumb
            items={[
              { href: "/admin/departments", label: "Departments" },
              { label: department.name },
            ]}
          />
        }
      />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <CatalogFormCard kicker="Edit department">
          <DepartmentForm
            department={department}
            readOnly={!canManageCatalog(staff.role)}
          />
        </CatalogFormCard>
      </div>
    </main>
  );
}
