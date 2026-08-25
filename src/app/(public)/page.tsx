import Link from "next/link";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { DoctorCard } from "@/components/public/doctor-card";
import { getPublicOrganization } from "@/server/tenant/getPublicOrganization";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [organization, departments, doctors] = await Promise.all([
    getPublicOrganization(),
    listDepartments({ activeOnly: true }),
    listDoctors({ activeOnly: true }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
      <section>
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          {organization?.name ?? "MediSlot"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          Find a doctor and book a visit
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
          Browse departments and doctor profiles. Online booking will open once
          schedules are published.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">Departments</h2>
          <Link href="/departments" className="text-sm text-zinc-600 hover:text-zinc-950">
            View all
          </Link>
        </div>
        {departments.length === 0 ? (
          <p className="text-sm text-zinc-500">No departments have been published yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {departments.slice(0, 6).map((department) => (
              <li key={department.id}>
                <Link
                  href={`/departments/${department.slug}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400"
                >
                  <p className="font-medium text-zinc-950">{department.name}</p>
                  {department.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                      {department.description}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">Doctors</h2>
          <Link href="/doctors" className="text-sm text-zinc-600 hover:text-zinc-950">
            View all
          </Link>
        </div>
        {doctors.length === 0 ? (
          <p className="text-sm text-zinc-500">No doctors have been published yet.</p>
        ) : (
          <ul className="grid gap-3">
            {doctors.slice(0, 6).map((doctor) => (
              <li key={doctor.id}>
                <DoctorCard doctor={doctor} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
