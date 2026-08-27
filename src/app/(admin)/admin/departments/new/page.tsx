import Link from "next/link";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { DepartmentForm } from "../department-form";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const dynamic = "force-dynamic";

export default async function NewDepartmentPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { href: "/admin/departments", label: "Departments" },
          { label: "New" },
        ]}
      />
      <PageHeader
        title="New department"
        description="Departments appear on the public site when they are active."
      />
      {canManage ? (
        <Card className="max-w-xl p-5 sm:p-6">
          <DepartmentForm readOnly={false} />
        </Card>
      ) : (
        <EmptyState
          title="You cannot add departments"
          description="Only owners and admins can change the catalog."
          action={
            <Link href="/admin/departments" className={buttonClass({ variant: "secondary" })}>
              Back to departments
            </Link>
          }
        />
      )}
    </main>
  );
}
