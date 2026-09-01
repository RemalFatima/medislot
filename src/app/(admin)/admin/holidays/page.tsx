import { Building2, CalendarOff, UserRound } from "lucide-react";
import { CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { HolidayCard } from "@/components/admin/holiday-card";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDoctors } from "@/server/catalog/doctors";
import { calendarDateInTimeZone } from "@/domain/availability/timezone";
import { listExceptions, type AvailabilityException } from "@/server/scheduling/exceptions";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { Card, cardGridHoverClass } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteExceptionButton } from "./delete-exception-button";
import { ExceptionForm } from "./exception-form";

export const dynamic = "force-dynamic";

function splitByDate(exceptions: AvailabilityException[], today: string) {
  const upcoming = exceptions
    .filter((item) => item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = exceptions
    .filter((item) => item.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}

export default async function AdminHolidaysPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const [exceptions, doctors, timezone] = await Promise.all([
    listExceptions(),
    listDoctors(),
    getOrganizationTimezone(),
  ]);
  const today = calendarDateInTimeZone(new Date(), timezone);
  const doctorNameById = new Map(
    doctors.map((doctor) => [doctor.id, doctor.full_name]),
  );
  const clinicWide = exceptions.filter((exception) => !exception.doctor_id);
  const doctorSpecific = exceptions.filter((exception) => exception.doctor_id);
  const upcomingCount = exceptions.filter((item) => item.date >= today).length;

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Clinic"
        title="Holidays & closures"
        description={`Clinic-wide dates apply to every doctor. Doctor dates apply to one person. Times are in ${timezone.replace(/_/g, " ")}.`}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {canManage ? (
          <Card className="overflow-hidden p-0">
            <div className="h-1.5 bg-primary" />
            <div className="bg-linear-to-b from-accent/40 to-surface p-5 sm:p-6">
              <h2 className="text-base font-semibold text-foreground">Add a date</h2>
              <p className="mt-1 mb-4 text-sm text-muted">
                Use holiday or unavailable for closures, leave for a doctor away,
                and special hours when open times change for one day.
              </p>
              <ExceptionForm
                key={exceptions.map((exception) => exception.id).join()}
                doctors={doctors}
              />
            </div>
          </Card>
        ) : (
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            Only owners and admins can add or remove holidays and closures.
          </p>
        )}

        {exceptions.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="No holidays or closures yet"
            description="Added dates will block or change booking availability on that day."
          />
        ) : (
          <>
            <p className="mt-8 mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <CalendarOff className="size-4 text-primary" aria-hidden />
              {exceptions.length === 1 ? "1 date" : `${exceptions.length} dates`}
              {upcomingCount > 0
                ? ` · ${upcomingCount} upcoming`
                : " · none upcoming"}
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <ExceptionList
                title="Clinic-wide"
                icon={Building2}
                empty="No clinic-wide dates."
                exceptions={clinicWide}
                doctorNameById={doctorNameById}
                canManage={canManage}
                today={today}
              />
              <ExceptionList
                title="Doctor-specific"
                icon={UserRound}
                empty="No doctor-specific dates."
                exceptions={doctorSpecific}
                doctorNameById={doctorNameById}
                canManage={canManage}
                today={today}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ExceptionList({
  title,
  icon: Icon,
  empty,
  exceptions,
  doctorNameById,
  canManage,
  today,
}: {
  title: string;
  icon: typeof Building2;
  empty: string;
  exceptions: AvailabilityException[];
  doctorNameById: Map<string, string>;
  canManage: boolean;
  today: string;
}) {
  const { upcoming, past } = splitByDate(exceptions, today);

  return (
    <section>
      <h2 className="mb-3 inline-flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon className="size-4 text-primary" aria-hidden />
        {title}
        <span className="text-sm font-normal text-muted">({exceptions.length})</span>
      </h2>
      {exceptions.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center"
          role="status"
        >
          <p className="text-sm text-muted">{empty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {upcoming.length > 0 ? (
            <ul className={`grid gap-3 ${cardGridHoverClass}`}>
              {upcoming.map((exception) => (
                <li key={exception.id}>
                  <HolidayCard
                    exception={exception}
                    doctorName={
                      exception.doctor_id
                        ? doctorNameById.get(exception.doctor_id)
                        : undefined
                    }
                    isPast={false}
                  >
                    {canManage ? <DeleteExceptionButton id={exception.id} /> : null}
                  </HolidayCard>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No upcoming dates in this list.</p>
          )}
          {past.length > 0 ? (
            <div>
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">
                Past
              </h3>
              <ul className={`grid gap-3 ${cardGridHoverClass}`}>
                {past.map((exception) => (
                  <li key={exception.id}>
                    <HolidayCard
                      exception={exception}
                      doctorName={
                        exception.doctor_id
                          ? doctorNameById.get(exception.doctor_id)
                          : undefined
                      }
                      isPast
                    >
                      {canManage ? <DeleteExceptionButton id={exception.id} /> : null}
                    </HolidayCard>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
