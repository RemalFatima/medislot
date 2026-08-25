import Link from "next/link";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const staff = await requireStaff();
  const [departments, doctors, services] = await Promise.all([
    listDepartments(),
    listDoctors(),
    listServices(),
  ]);

  return (
    <main className="px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Dashboard
      </h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-600">
        Manage departments, doctors, and services. Scheduling and booking come
        next.
      </p>
      <dl className="mt-8 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
        <Link
          href="/admin/departments"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
        >
          <dt className="text-zinc-500">Departments</dt>
          <dd className="mt-1 text-2xl font-semibold text-zinc-900">
            {departments.length}
          </dd>
        </Link>
        <Link
          href="/admin/doctors"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
        >
          <dt className="text-zinc-500">Doctors</dt>
          <dd className="mt-1 text-2xl font-semibold text-zinc-900">
            {doctors.length}
          </dd>
        </Link>
        <Link
          href="/admin/services"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
        >
          <dt className="text-zinc-500">Services</dt>
          <dd className="mt-1 text-2xl font-semibold text-zinc-900">
            {services.length}
          </dd>
        </Link>
      </dl>
      <p className="mt-6 text-xs text-zinc-500">
        Signed in as {staff.email ?? "staff"} ({staff.role})
      </p>
    </main>
  );
}
