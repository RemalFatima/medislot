import { getDashboardSummary } from "@/server/analytics/dashboard";
import { APPOINTMENT_STATUS_LABELS } from "@/server/appointments/labels";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { getOrganizationSettings } from "@/server/settings/organization";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const staff = await requireStaff();
  const [organization, departments, doctors, services, summary] =
    await Promise.all([
      getOrganizationSettings(),
      listDepartments(),
      listDoctors(),
      listServices(),
      getDashboardSummary(),
    ]);

  return (
    <main className="px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Dashboard
      </h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-600">
        {organization?.name ?? "Clinic"} · {summary.timezone}
      </p>

      <dl className="mt-8 grid max-w-3xl gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <dt className="text-zinc-500">Today</dt>
          <dd className="mt-1 text-2xl font-semibold text-zinc-900">
            {summary.todayTotal}
          </dd>
          <p className="mt-1 text-xs text-zinc-500">{summary.today}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <dt className="text-zinc-500">This week</dt>
          <dd className="mt-1 text-2xl font-semibold text-zinc-900">
            {summary.weekTotal}
          </dd>
          <p className="mt-1 text-xs text-zinc-500">
            From {summary.weekStart} (Monday)
          </p>
        </div>
      </dl>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-sm font-semibold text-zinc-950">Today by status</h2>
        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {summary.todayByStatus.map((row) => (
            <li
              key={row.status}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span className="text-zinc-700">
                {APPOINTMENT_STATUS_LABELS[row.status]}
              </span>
              <span className="font-medium text-zinc-950">{row.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-sm font-semibold text-zinc-950">This week by doctor</h2>
        {summary.weekByDoctor.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No visits this week.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {summary.weekByDoctor.map((row) => (
              <li
                key={row.doctorId}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <span className="text-zinc-700">{row.name}</span>
                <span className="font-medium text-zinc-950">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <dl className="mt-10 grid max-w-3xl gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
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
        <Link
          href="/admin/appointments"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
        >
          <dt className="text-zinc-500">Appointments</dt>
          <dd className="mt-1 text-sm font-medium text-zinc-900">Open list</dd>
        </Link>
      </dl>
      <p className="mt-6 text-xs text-zinc-500">
        Signed in as {staff.email ?? "staff"} ({staff.role})
      </p>
    </main>
  );
}
