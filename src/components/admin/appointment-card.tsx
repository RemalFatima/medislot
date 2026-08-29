import type { ReactNode } from "react";
import { Clock3, Phone, Stethoscope, UserRound } from "lucide-react";
import { AppointmentSourceBadge } from "@/components/admin/appointment-source-badge";
import { AppointmentStatusBadge } from "@/components/admin/appointment-status-badge";
import { Card } from "@/components/ui/card";
import { formatAppointmentTime } from "@/server/appointments/format";
import type { AppointmentListItem } from "@/server/appointments/list";
import type { AppointmentStatus } from "@/types/database";

const barClass: Record<AppointmentStatus, string> = {
  pending: "bg-warning",
  confirmed: "bg-primary",
  completed: "bg-success",
  cancelled: "bg-surface-muted",
  no_show: "bg-danger",
};

export function AppointmentCard({
  appointment,
  doctorName,
  serviceName,
  timezone,
  children,
}: {
  appointment: AppointmentListItem;
  doctorName: string;
  serviceName: string;
  timezone: string;
  children: ReactNode;
}) {
  const start = formatAppointmentTime(appointment.start_at, timezone);
  const end = formatAppointmentTime(appointment.end_at, timezone);

  return (
    <Card className="overflow-hidden p-0">
      <div className={`h-1.5 ${barClass[appointment.status]}`} />
      <div className="bg-linear-to-b from-accent/35 to-surface p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-accent px-5 py-4 sm:min-w-28">
            <Clock3 className="size-4 text-primary" aria-hidden />
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-primary">
              {start}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted">to {end}</p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {appointment.patient_name}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                  <Phone className="size-3.5 shrink-0" aria-hidden />
                  {appointment.patient_phone}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AppointmentSourceBadge source={appointment.source} />
                <AppointmentStatusBadge status={appointment.status} />
              </div>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface/80 px-3 py-2.5 ring-1 ring-border">
                <dt className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                  <UserRound className="size-3.5" aria-hidden />
                  Doctor
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{doctorName}</dd>
              </div>
              <div className="rounded-xl bg-surface/80 px-3 py-2.5 ring-1 ring-border">
                <dt className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                  <Stethoscope className="size-3.5" aria-hidden />
                  Service
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{serviceName}</dd>
              </div>
            </dl>

            {appointment.notes ? (
              <p className="mt-3 text-sm leading-6 text-muted">{appointment.notes}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">{children}</div>
      </div>
    </Card>
  );
}
