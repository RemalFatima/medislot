import Link from "next/link";
import { getDashboardSummary } from "@/server/analytics/dashboard";
import { AppointmentStatusBadge } from "@/components/admin/appointment-status-badge";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { getOrganizationSettings } from "@/server/settings/organization";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

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

export default async function AdminPage() {
  await requireStaff();
  const [organization, departments, doctors, services, summary] =
    await Promise.all([
      getOrganizationSettings(),
      listDepartments(),
      listDoctors(),
      listServices(),
      getDashboardSummary(),
    ]);

  const statusMax = Math.max(summary.todayTotal, 1);
  const doctorMax = Math.max(...summary.weekByDoctor.map((row) => row.count), 1);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Dashboard"
        description={`${organization?.name ?? "Clinic"} · times in ${summary.timezone.replace(/_/g, " ")}`}
        actions={
          <Link href="/admin/appointments" className={buttonClass()}>
            Today&apos;s appointments
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-muted">Today</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {summary.todayTotal}
          </p>
          <p className="mt-1 text-sm text-muted">{formatIsoDate(summary.today)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">This week</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {summary.weekTotal}
          </p>
          <p className="mt-1 text-sm text-muted">
            From {formatIsoDate(summary.weekStart)} (Monday)
          </p>
        </Card>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground">Today by status</h2>
          <p className="mt-1 text-sm text-muted">
            Counts for {formatIsoDate(summary.today)} only.
          </p>
          <ul className="mt-4 space-y-3">
            {summary.todayByStatus.map((row) => (
              <li key={row.status}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <AppointmentStatusBadge status={row.status} />
                  <span className="text-sm font-medium text-foreground">{row.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      row.status === "confirmed" && "bg-info",
                      row.status === "pending" && "bg-warning",
                      row.status === "completed" && "bg-success",
                      row.status === "cancelled" && "bg-muted",
                      row.status === "no_show" && "bg-danger",
                    )}
                    style={{ width: `${Math.round((row.count / statusMax) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground">This week by doctor</h2>
          <p className="mt-1 text-sm text-muted">
            Appointments from Monday through today.
          </p>
          {summary.weekByDoctor.length === 0 ? (
            <EmptyState
              className="mt-4"
              title="No visits this week"
              description="Booked appointments will show here by doctor."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {summary.weekByDoctor.map((row) => (
                <li key={row.doctorId}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-foreground">{row.name}</span>
                    <span className="shrink-0 text-sm font-medium text-foreground">
                      {row.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.round((row.count / doctorMax) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-foreground">Catalog</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/departments" className="block rounded-xl">
            <Card className="p-4 transition-colors hover:border-primary/30">
              <p className="text-sm text-muted">Departments</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {departments.length}
              </p>
            </Card>
          </Link>
          <Link href="/admin/doctors" className="block rounded-xl">
            <Card className="p-4 transition-colors hover:border-primary/30">
              <p className="text-sm text-muted">Doctors</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {doctors.length}
              </p>
            </Card>
          </Link>
          <Link href="/admin/services" className="block rounded-xl">
            <Card className="p-4 transition-colors hover:border-primary/30">
              <p className="text-sm text-muted">Services</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {services.length}
              </p>
            </Card>
          </Link>
          <Link href="/admin/appointments" className="block rounded-xl">
            <Card className="p-4 transition-colors hover:border-primary/30">
              <p className="text-sm text-muted">Appointments</p>
              <p className="mt-1 text-sm font-medium text-foreground">Open today&apos;s list</p>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  );
}
