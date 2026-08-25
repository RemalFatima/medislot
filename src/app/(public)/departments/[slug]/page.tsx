import { notFound } from "next/navigation";
import { getDepartmentBySlug } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { DoctorCard } from "@/components/public/doctor-card";

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
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        {department.name}
      </h1>
      {department.description ? (
        <p className="mt-3 max-w-2xl text-zinc-600">{department.description}</p>
      ) : null}
      <h2 className="mt-10 text-lg font-semibold text-zinc-950">Doctors</h2>
      {doctors.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600">
          No doctors are listed in this department yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {doctors.map((doctor) => (
            <li key={doctor.id}>
              <DoctorCard doctor={doctor} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
