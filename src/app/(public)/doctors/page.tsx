import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { listDepartments } from "@/server/catalog/departments";
import {
  listDoctorProfessions,
  listDoctors,
  listDoctorSpecializations,
} from "@/server/catalog/doctors";
import { DoctorCard } from "@/components/public/doctor-card";
import { DoctorsFilters } from "@/components/public/doctors-filters";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

function matchesQuery(
  doctor: {
    full_name: string;
    profession: string;
    specialization: string | null;
    departments: { name: string }[];
  },
  query: string,
) {
  const haystack = [
    doctor.full_name,
    doctor.profession,
    doctor.specialization ?? "",
    ...doctor.departments.map((department) => department.name),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    department?: string;
    profession?: string;
    specialization?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const departmentSlug = params.department?.trim() || undefined;
  const profession = params.profession?.trim() || undefined;
  const specialization = params.specialization?.trim() || undefined;
  const hasFilters = Boolean(query || departmentSlug || profession || specialization);

  const [departments, professions, specializations, doctors] = await Promise.all([
    listDepartments({ activeOnly: true }),
    listDoctorProfessions(),
    listDoctorSpecializations(),
    listDoctors({
      activeOnly: true,
      departmentSlug,
      profession,
      specialization,
    }),
  ]);

  const visibleDoctors = query
    ? doctors.filter((doctor) => matchesQuery(doctor, query))
    : doctors;
  const countLabel =
    visibleDoctors.length === 1 ? "1 doctor" : `${visibleDoctors.length} doctors`;

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-accent">
        <Container className="py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Clinicians
          </p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Doctors
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Search by name or filter by department, profession, and specialization.
              </p>
            </div>
            <Link href="/departments" className={buttonClass({ variant: "secondary" })}>
              Browse departments
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
        <DoctorsFilters
          departments={departments}
          professions={professions}
          specializations={specializations}
          filters={{
            q: query,
            department: departmentSlug,
            profession,
            specialization,
          }}
        />
        {visibleDoctors.length === 0 ? (
          <EmptyState
            className="mt-8"
            title={
              hasFilters
                ? "No doctors match these filters"
                : "No doctors have been published yet"
            }
            description={
              hasFilters
                ? "Try a different name or clear the filters to see everyone."
                : "Doctor profiles will appear here once the clinic publishes them."
            }
            action={
              hasFilters ? (
                <Link href="/doctors" className={buttonClass({ variant: "secondary" })}>
                  Clear filters
                </Link>
              ) : (
                <Link href="/departments" className={buttonClass({ variant: "secondary" })}>
                  Browse departments
                </Link>
              )
            }
          />
        ) : (
          <>
            <p className="mt-8 mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <Stethoscope className="size-4 text-primary" aria-hidden />
              {countLabel}
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
              {visibleDoctors.map((doctor) => (
                <li key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </main>
  );
}
