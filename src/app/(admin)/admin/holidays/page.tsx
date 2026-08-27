import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDoctors } from "@/server/catalog/doctors";
import {
  exceptionTypeLabel,
  timeInputValue,
} from "@/server/scheduling/constants";
import { listExceptions } from "@/server/scheduling/exceptions";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import type { ExceptionType } from "@/types/database";
import { DeleteExceptionButton } from "./delete-exception-button";
import { ExceptionForm } from "./exception-form";

export const dynamic = "force-dynamic";

const TYPE_TONE: Record<
  ExceptionType,
  "neutral" | "success" | "warning" | "danger" | "info" | "primary"
> = {
  holiday: "primary",
  leave: "warning",
  special_hours: "info",
  unavailable: "danger",
};

function formatIsoDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default async function AdminHolidaysPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const [exceptions, doctors, timezone] = await Promise.all([
    listExceptions(),
    listDoctors(),
    getOrganizationTimezone(),
  ]);
  const doctorNameById = new Map(
    doctors.map((doctor) => [doctor.id, doctor.full_name]),
  );
  const clinicWide = exceptions.filter((exception) => !exception.doctor_id);
  const doctorSpecific = exceptions.filter((exception) => exception.doctor_id);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Holidays & closures"
        description={`Clinic-wide dates apply to every doctor. Doctor dates apply to one person. Times are in ${timezone.replace(/_/g, " ")}.`}
      />

      {canManage ? (
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">Add a date</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Use holiday or unavailable for closures, leave for a doctor away, and
            special hours when the clinic or doctor is open with different times.
          </p>
          <ExceptionForm
            key={exceptions.map((exception) => exception.id).join()}
            doctors={doctors}
          />
        </Card>
      ) : (
        <p className="mb-6 text-sm text-muted">
          Only owners and admins can add or remove holidays and closures.
        </p>
      )}

      {exceptions.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No holidays or closures yet"
          description="Added dates will block or change booking availability on that day."
        />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ExceptionList
            title="Clinic-wide"
            empty="No clinic-wide dates."
            exceptions={clinicWide}
            doctorNameById={doctorNameById}
            canManage={canManage}
          />
          <ExceptionList
            title="Doctor-specific"
            empty="No doctor-specific dates."
            exceptions={doctorSpecific}
            doctorNameById={doctorNameById}
            canManage={canManage}
          />
        </div>
      )}
    </main>
  );
}

function ExceptionList({
  title,
  empty,
  exceptions,
  doctorNameById,
  canManage,
}: {
  title: string;
  empty: string;
  exceptions: Awaited<ReturnType<typeof listExceptions>>;
  doctorNameById: Map<string, string>;
  canManage: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
      {exceptions.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="grid gap-3">
          {exceptions.map((exception) => (
            <li key={exception.id}>
              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {formatIsoDate(exception.date)}
                    </p>
                    <Badge tone={TYPE_TONE[exception.type]}>
                      {exceptionTypeLabel(exception.type)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {exception.doctor_id
                      ? (doctorNameById.get(exception.doctor_id) ?? "Doctor")
                      : "Entire clinic"}
                    {exception.start_time && exception.end_time
                      ? ` · ${timeInputValue(exception.start_time)}–${timeInputValue(exception.end_time)}`
                      : " · all day"}
                  </p>
                  {exception.reason ? (
                    <p className="mt-1 text-sm text-foreground">{exception.reason}</p>
                  ) : null}
                </div>
                {canManage ? <DeleteExceptionButton id={exception.id} /> : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
