import Link from "next/link";
import { CatalogFormCard, CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { DepartmentForm } from "../department-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function NewDepartmentPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Catalog"
        title="New department"
        description="Departments appear on the public site when they are active."
        breadcrumb={
          <Breadcrumb
            items={[
              { href: "/admin/departments", label: "Departments" },
              { label: "New" },
            ]}
          />
        }
      />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {canManage ? (
          <CatalogFormCard kicker="Department details">
            <DepartmentForm readOnly={false} />
          </CatalogFormCard>
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
      </div>
    </main>
  );
}
