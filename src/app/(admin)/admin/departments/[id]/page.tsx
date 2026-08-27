import { notFound } from "next/navigation";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { getDepartmentById } from "@/server/catalog/departments";
import { DepartmentForm } from "../department-form";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { href: "/admin/departments", label: "Departments" },
          { label: department.name },
        ]}
      />
      <PageHeader
        title={department.name}
        description="Uncheck Active to hide this department from the public site. Catalog rows are not deleted."
        actions={<VisibilityBadge active={department.is_active} />}
      />
      <Card className="max-w-xl p-5 sm:p-6">
        <DepartmentForm
          department={department}
          readOnly={!canManageCatalog(staff.role)}
        />
      </Card>
    </main>
  );
}
