import Link from "next/link";
import { calendarDateInTimeZone } from "@/domain/availability/timezone";
import { requireStaff } from "@/server/auth/requireStaff";
import { formatAppointmentWhen } from "@/server/appointments/format";
import {
  APPOINTMENT_SOURCE_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from "@/server/appointments/labels";
import { listAppointments } from "@/server/appointments/list";
import { listDoctors } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { fieldClass } from "@/components/ui/field";
import type { AppointmentStatus } from "@/types/database";
import { StatusForm } from "./status-form";

export const dynamic = "force-dynamic";

const STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; doctor?: string; status?: string }>;
}) {
  await requireStaff();
  const filters = await searchParams;
  const timezone = await getOrganizationTimezone();
  const today = calendarDateInTimeZone(new Date(), timezone);
  const date =
    filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)
      ? filters.date
      : today;
  const status = STATUSES.find((value) => value === filters.status);
  const [doctors, services, appointments] = await Promise.all([
    listDoctors(),
    listServices(),
    listAppointments({
      date,
      timezone,
      doctorId: filters.doctor || undefined,
      status,
    }),
  ]);
  const doctorName = new Map(doctors.map((doctor) => [doctor.id, doctor.full_name]));
  const serviceName = new Map(services.map((service) => [service.id, service.name]));

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Times in {timezone}</p>
        </div>
        <Link
          href="/admin/appointments/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Walk-in
        </Link>
      </div>

      <form className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-600">Date</span>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className={`${fieldClass} w-full`}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-600">Doctor</span>
          <select
            name="doctor"
            defaultValue={filters.doctor ?? ""}
            className={`${fieldClass} w-full`}
          >
            <option value="">All</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-600">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className={`${fieldClass} w-full`}
          >
            <option value="">All</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {APPOINTMENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="h-11 w-full rounded-md border border-zinc-300 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Filter
          </button>
        </div>
      </form>

      {appointments.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">No appointments on this day.</p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-zinc-950">
                  {formatAppointmentWhen(appointment.start_at, timezone)}
                </p>
                <p className="text-sm text-zinc-700">
                  {appointment.patient_name} · {appointment.patient_phone}
                </p>
                <p className="text-xs text-zinc-500">
                  {doctorName.get(appointment.doctor_id) ?? "Doctor"} ·{" "}
                  {serviceName.get(appointment.service_id) ?? "Service"} ·{" "}
                  {APPOINTMENT_SOURCE_LABELS[appointment.source]} ·{" "}
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </p>
                {appointment.notes ? (
                  <p className="mt-1 text-sm text-zinc-600">{appointment.notes}</p>
                ) : null}
              </div>
              <StatusForm id={appointment.id} status={appointment.status} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
