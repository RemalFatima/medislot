import Link from "next/link";
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
import { PageHeader } from "@/components/ui/page-header";

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

  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container>
        <PageHeader
          title="Doctors"
          description="Search by name or filter by department, profession, and specialization."
        />
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
            <p className="mt-6 text-sm text-muted">
              {visibleDoctors.length === 1
                ? "1 doctor"
                : `${visibleDoctors.length} doctors`}
            </p>
            <ul className="mt-3 grid gap-4 md:grid-cols-2">
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
