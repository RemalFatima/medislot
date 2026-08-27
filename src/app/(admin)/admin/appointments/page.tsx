import Link from "next/link";
import { calendarDateInTimeZone } from "@/domain/availability/timezone";
import { AppointmentStatusBadge } from "@/components/admin/appointment-status-badge";
import { AppointmentsFilters } from "@/components/admin/appointments-filters";
import { requireStaff } from "@/server/auth/requireStaff";
import {
  formatAppointmentTime,
  formatAppointmentWhen,
} from "@/server/appointments/format";
import { APPOINTMENT_SOURCE_LABELS } from "@/server/appointments/labels";
import { listAppointments } from "@/server/appointments/list";
import { listDoctors } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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

function formatIsoDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

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
  const doctorId = filters.doctor || undefined;
  const [doctors, services, appointments] = await Promise.all([
    listDoctors(),
    listServices(),
    listAppointments({
      date,
      timezone,
      doctorId,
      status,
    }),
  ]);
  const doctorName = new Map(doctors.map((doctor) => [doctor.id, doctor.full_name]));
  const serviceName = new Map(services.map((service) => [service.id, service.name]));
  const isToday = date === today;
  const hasExtraFilters = Boolean(doctorId || status);
  const todayHref = hasExtraFilters
    ? `/admin/appointments?date=${today}${doctorId ? `&doctor=${doctorId}` : ""}${status ? `&status=${status}` : ""}`
    : "/admin/appointments";

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Appointments"
        description={`${formatIsoDate(date)}${isToday ? " · Today" : ""} · times in ${timezone.replace(/_/g, " ")}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {isToday ? null : (
              <Link href={todayHref} className={buttonClass({ variant: "secondary" })}>
                Today
              </Link>
            )}
            <Link href="/admin/appointments/new" className={buttonClass()}>
              Walk-in
            </Link>
          </div>
        }
      />

      <Card className="p-4 sm:p-5">
        <AppointmentsFilters
          date={date}
          doctorId={doctorId}
          status={status}
          doctors={doctors}
        />
      </Card>

      {appointments.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No appointments on this day"
          description={
            hasExtraFilters
              ? "Try another date, doctor, or status."
              : "Walk-in visits and online bookings for this date will appear here."
          }
          action={
            <Link href="/admin/appointments/new" className={buttonClass({ variant: "secondary" })}>
              Create walk-in
            </Link>
          }
        />
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {appointments.length === 1
              ? "1 appointment"
              : `${appointments.length} appointments`}
            {isToday ? " today" : ""}
          </p>

          <ul className="mt-3 grid gap-3 lg:hidden">
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {formatAppointmentTime(appointment.start_at, timezone)}
                      </p>
                      <p className="mt-1 font-medium text-foreground">
                        {appointment.patient_name}
                      </p>
                      <p className="text-sm text-muted">{appointment.patient_phone}</p>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    {doctorName.get(appointment.doctor_id) ?? "Doctor"} ·{" "}
                    {serviceName.get(appointment.service_id) ?? "Service"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={appointment.source === "public" ? "primary" : "neutral"}>
                      {APPOINTMENT_SOURCE_LABELS[appointment.source]}
                    </Badge>
                    <span className="truncate font-mono text-xs text-muted">
                      {appointment.confirmation_token}
                    </span>
                  </div>
                  {appointment.notes ? (
                    <p className="mt-2 text-sm text-muted">{appointment.notes}</p>
                  ) : null}
                  <div className="mt-4">
                    <StatusForm id={appointment.id} status={appointment.status} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-176 border-collapse text-sm">
              <caption className="sr-only">Appointments</caption>
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th scope="col" className="py-3 pr-4 font-medium">Time</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Patient</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Doctor</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Service</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Source</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Status</th>
                  <th scope="col" className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-border align-top">
                    <td className="py-3 pr-4">
                      <p className="font-semibold tabular-nums text-foreground">
                        {formatAppointmentTime(appointment.start_at, timezone)}
                      </p>
                      <p className="text-xs text-muted">
                        {formatAppointmentWhen(appointment.start_at, timezone)}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">{appointment.patient_name}</p>
                      <p className="text-muted">{appointment.patient_phone}</p>
                      {appointment.notes ? (
                        <p className="mt-1 text-muted">{appointment.notes}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {doctorName.get(appointment.doctor_id) ?? "Doctor"}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {serviceName.get(appointment.service_id) ?? "Service"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={appointment.source === "public" ? "primary" : "neutral"}>
                        {APPOINTMENT_SOURCE_LABELS[appointment.source]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                    <td className="py-3">
                      <StatusForm id={appointment.id} status={appointment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
