import Link from "next/link";
import { Building2 } from "lucide-react";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import {
  countDoctorsByDepartment,
  DepartmentCard,
} from "@/components/public/department-card";
import { buttonClass } from "@/components/ui/button";
import { cardGridHoverClass } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const [departments, doctors] = await Promise.all([
    listDepartments({ activeOnly: true }),
    listDoctors({ activeOnly: true }),
  ]);
  const doctorCounts = countDoctorsByDepartment(doctors);
  const countLabel =
    departments.length === 1 ? "1 department" : `${departments.length} departments`;

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-accent">
        <Container className="py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Care areas
          </p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Departments
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Start with the care area you need, then choose a doctor who practices there.
              </p>
            </div>
            <Link href="/doctors" className={buttonClass({ variant: "secondary" })}>
              Browse doctors
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
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
          <>
            <p className="mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <Building2 className="size-4 text-primary" aria-hidden />
              {countLabel}
            </p>
            <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${cardGridHoverClass}`}>
              {departments.map((department) => (
                <li key={department.id}>
                  <DepartmentCard
                    department={department}
                    doctorCount={doctorCounts.get(department.id) ?? 0}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </main>
  );
}
