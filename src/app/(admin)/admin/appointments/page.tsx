import Link from "next/link";
import { DoorOpen } from "lucide-react";
import { calendarDateInTimeZone } from "@/domain/availability/timezone";
import { AppointmentCard } from "@/components/admin/appointment-card";
import { AppointmentsFilters } from "@/components/admin/appointments-filters";
import { requireStaff } from "@/server/auth/requireStaff";
import { listAppointments } from "@/server/appointments/list";
import { listDoctors } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
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
  const returnQuery = new URLSearchParams({ date });
  if (doctorId) {
    returnQuery.set("doctor", doctorId);
  }
  if (status) {
    returnQuery.set("status", status);
  }
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
              <DoorOpen className="size-4" aria-hidden />
              New walk-in
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
              <DoorOpen className="size-4" aria-hidden />
              New walk-in
            </Link>
          }
        />
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">
            {appointments.length === 1
              ? "1 appointment"
              : `${appointments.length} appointments`}
            {isToday ? " today" : ""}
          </p>

          <ul className="mt-4 grid gap-4 xl:grid-cols-2">
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  doctorName={doctorName.get(appointment.doctor_id) ?? "Doctor"}
                  serviceName={serviceName.get(appointment.service_id) ?? "Service"}
                  timezone={timezone}
                >
                  <StatusForm
                    id={appointment.id}
                    status={appointment.status}
                    returnQuery={returnQuery.toString()}
                  />
                </AppointmentCard>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
