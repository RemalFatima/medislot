import Link from "next/link";
import { notFound } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { getDepartmentBySlug } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { DoctorCard } from "@/components/public/doctor-card";
import { buttonClass } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

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
  const countLabel = doctors.length === 1 ? "1 doctor" : `${doctors.length} doctors`;

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-accent">
        <Container className="py-10 sm:py-12">
          <Breadcrumb
            items={[
              { href: "/departments", label: "Departments" },
              { label: department.name },
            ]}
          />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-lg font-semibold text-primary shadow-[var(--shadow-card)] ring-1 ring-primary/10">
                {department.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {department.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  {department.description ??
                    "Doctors who practice in this department are listed below."}
                </p>
              </div>
            </div>
            <Link
              href="/doctors"
              className={buttonClass({ variant: "secondary", className: "shrink-0" })}
            >
              All doctors
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
        <p className="mb-4 inline-flex items-center gap-2 text-sm text-muted">
          <Stethoscope className="size-4 text-primary" aria-hidden />
          {countLabel}
        </p>
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
