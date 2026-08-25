import { listDepartments } from "@/server/catalog/departments";
import {
  listDoctorProfessions,
  listDoctors,
  listDoctorSpecializations,
} from "@/server/catalog/doctors";
import { DoctorCard } from "@/components/public/doctor-card";

export const dynamic = "force-dynamic";

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    department?: string;
    profession?: string;
    specialization?: string;
  }>;
}) {
  const filters = await searchParams;
  const departmentSlug = filters.department?.trim() || undefined;
  const profession = filters.profession?.trim() || undefined;
  const specialization = filters.specialization?.trim() || undefined;

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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Doctors
      </h1>
      <form className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-600">Department</span>
          <select
            name="department"
            defaultValue={departmentSlug ?? ""}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-2"
          >
            <option value="">All</option>
            {departments.map((department) => (
              <option key={department.id} value={department.slug}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-600">Profession</span>
          <select
            name="profession"
            defaultValue={profession ?? ""}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-2"
          >
            <option value="">All</option>
            {professions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-600">Specialization</span>
          <select
            name="specialization"
            defaultValue={specialization ?? ""}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-2"
          >
            <option value="">All</option>
            {specializations.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="h-10 w-full rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Filter
          </button>
        </div>
      </form>
      {doctors.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">No doctors match these filters.</p>
      ) : (
        <ul className="mt-6 grid gap-3">
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
