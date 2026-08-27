import Link from "next/link";
import { notFound } from "next/navigation";
import { getDepartmentBySlug } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { DoctorCard } from "@/components/public/doctor-card";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  const doctors = await listDoctors({
    activeOnly: true,
    departmentSlug: department.slug,
  });

  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container>
        <p className="mb-4 text-sm text-muted">
          <Link href="/departments" className="hover:text-foreground">
            Departments
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span className="text-foreground">{department.name}</span>
        </p>
        <PageHeader
          title={department.name}
          description={
            department.description ??
            "Doctors who practice in this department are listed below."
          }
          actions={
            <Link href="/doctors" className={buttonClass({ variant: "secondary", size: "sm" })}>
              All doctors
            </Link>
          }
        />
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Doctors
          <span className="ml-2 text-sm font-normal text-muted">
            {doctors.length === 1 ? "1 doctor" : `${doctors.length} doctors`}
          </span>
        </h2>
        {doctors.length === 0 ? (
          <EmptyState
            title="No doctors in this department yet"
            description="Try another department, or browse the full doctor list."
            action={
              <Link href="/doctors" className={buttonClass({ variant: "secondary" })}>
                Browse doctors
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                <DoctorCard doctor={doctor} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
