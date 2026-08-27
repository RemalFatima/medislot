import Link from "next/link";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import {
  countDoctorsByDepartment,
  DepartmentCard,
} from "@/components/public/department-card";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const [departments, doctors] = await Promise.all([
    listDepartments({ activeOnly: true }),
    listDoctors({ activeOnly: true }),
  ]);
  const doctorCounts = countDoctorsByDepartment(doctors);

  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container>
        <PageHeader
          title="Departments"
          description="Choose a department to see the doctors who practice there."
        />
        {departments.length === 0 ? (
          <EmptyState
            title="No departments are available yet"
            description="The clinic has not published departments on this site."
            action={
              <Link href="/doctors" className={buttonClass({ variant: "secondary" })}>
                Browse doctors
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <li key={department.id}>
                <DepartmentCard
                  department={department}
                  doctorCount={doctorCounts.get(department.id) ?? 0}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
