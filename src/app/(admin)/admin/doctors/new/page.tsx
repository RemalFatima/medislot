import Link from "next/link";
import { CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listServices } from "@/server/catalog/services";
import { DoctorForm } from "../doctor-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function NewDoctorPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const [departments, services] = await Promise.all([
    listDepartments(),
    listServices(),
  ]);

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Catalog"
        title="New doctor"
        description="Assign departments and services so the doctor can appear in public booking."
        breadcrumb={
          <Breadcrumb
            items={[
              { href: "/admin/doctors", label: "Doctors" },
              { label: "New" },
            ]}
          />
        }
      />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {canManage ? (
          <DoctorForm
            departments={departments}
            services={services}
            readOnly={false}
          />
        ) : (
          <EmptyState
            title="You cannot add doctors"
            description="Only owners and admins can change the catalog."
            action={
              <Link href="/admin/doctors" className={buttonClass({ variant: "secondary" })}>
                Back to doctors
              </Link>
            }
          />
        )}
      </div>
    </main>
  );
}
