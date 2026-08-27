import Link from "next/link";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listServices } from "@/server/catalog/services";
import { DoctorForm } from "../doctor-form";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function NewDoctorPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const [departments, services] = await Promise.all([
    listDepartments(),
    listServices(),
  ]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm text-muted">
        <Link href="/admin/doctors" className="hover:text-foreground">
          Doctors
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-foreground">New</span>
      </p>
      <PageHeader
        title="New doctor"
        description="Assign departments and services so the doctor can appear in public booking."
      />
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
    </main>
  );
}
