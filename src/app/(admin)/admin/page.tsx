import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  ClipboardList,
  Stethoscope,
} from "lucide-react";
import { getDashboardSummary } from "@/server/analytics/dashboard";
import { AppointmentStatusBadge } from "@/components/admin/appointment-status-badge";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import { listServices } from "@/server/catalog/services";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/brand";

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
  const [departments, doctors, services, summary] = await Promise.all([
    listDepartments(),
    listDoctors(),
    listServices(),
    getDashboardSummary(),
  ]);

  const statusMax = Math.max(summary.todayTotal, 1);
  const doctorMax = Math.max(...summary.weekByDoctor.map((row) => row.count), 1);

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-accent">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {APP_NAME}
          </p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-muted">
                Times in {summary.timezone.replace(/_/g, " ")}
              </p>
            </div>
            <Link href="/admin/appointments" className={buttonClass()}>
              Today&apos;s appointments
            </Link>
          </div>
        </div>
      </section>

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div className="h-1.5 bg-primary" />
            <div className="bg-linear-to-b from-accent/50 to-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-muted">Today</p>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-surface text-primary shadow-(--shadow-card) ring-1 ring-primary/10">
                  <CalendarDays className="size-5" aria-hidden />
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                {summary.todayTotal}
              </p>
              <p className="mt-1 text-sm text-muted">{formatIsoDate(summary.today)}</p>
            </div>
          </Card>
          <Card className="overflow-hidden p-0">
            <div className="h-1.5 bg-primary" />
            <div className="bg-linear-to-b from-accent/50 to-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-muted">This week</p>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-surface text-primary shadow-(--shadow-card) ring-1 ring-primary/10">
                  <CalendarRange className="size-5" aria-hidden />
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                {summary.weekTotal}
              </p>
              <p className="mt-1 text-sm text-muted">
                From {formatIsoDate(summary.weekStart)} (Monday)
              </p>
            </div>
          </Card>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div className="h-1.5 bg-primary" />
            <div className="p-5">
              <h2 className="text-base font-semibold text-foreground">Today by status</h2>
              <p className="mt-1 text-sm text-muted">
                Counts for {formatIsoDate(summary.today)} only.
              </p>
              <ul className="mt-5 space-y-4">
                {summary.todayByStatus.map((row) => (
                  <li key={row.status}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <AppointmentStatusBadge status={row.status} />
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {row.count}
                      </span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-surface-muted"
                      aria-hidden
                    >
                      <div
                        className={cn(
                          "h-2.5 rounded-full",
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
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="h-1.5 bg-primary" />
            <div className="p-5">
              <h2 className="text-base font-semibold text-foreground">This week by doctor</h2>
              <p className="mt-1 text-sm text-muted">
                Appointments from Monday through today.
              </p>
              {summary.weekByDoctor.length === 0 ? (
                <div
                  className="mt-6 flex flex-col items-center rounded-xl bg-accent/60 px-4 py-10 text-center"
                  role="status"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-primary shadow-(--shadow-card) ring-1 ring-primary/10">
                    <Stethoscope className="size-5" aria-hidden />
                  </span>
                  <p className="mt-4 font-medium text-foreground">No visits this week</p>
                  <p className="mt-1 max-w-xs text-sm text-muted">
                    Booked appointments will show here by doctor.
                  </p>
                </div>
              ) : (
                <ul className="mt-5 space-y-4">
                  {summary.weekByDoctor.map((row) => (
                    <li key={row.doctorId}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-foreground">
                          {row.name}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {row.count}
                        </span>
                      </div>
                      <div
                        className="h-2.5 overflow-hidden rounded-full bg-surface-muted"
                        aria-hidden
                      >
                        <div
                          className="h-2.5 rounded-full bg-primary"
                          style={{
                            width: `${Math.round((row.count / doctorMax) * 100)}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-foreground">Catalog</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Jump into the lists you manage from the clinic console.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CatalogLink
              href="/admin/departments"
              icon={Building2}
              label="Departments"
              value={String(departments.length)}
            />
            <CatalogLink
              href="/admin/doctors"
              icon={Stethoscope}
              label="Doctors"
              value={String(doctors.length)}
            />
            <CatalogLink
              href="/admin/services"
              icon={ClipboardList}
              label="Services"
              value={String(services.length)}
            />
            <CatalogLink
              href="/admin/appointments"
              icon={CalendarDays}
              label="Appointments"
              value="Open today"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function CatalogLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <Link href={href} className="block h-full rounded-xl">
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-[transform,border-color,box-shadow] motion-safe:hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-(--shadow-card)">
        <div className="h-1.5 bg-primary" />
        <div className="flex flex-1 flex-col bg-linear-to-b from-accent/40 to-surface p-4">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-surface text-primary shadow-(--shadow-card) ring-1 ring-primary/10">
            <Icon className="size-5" aria-hidden />
          </span>
          <p className="mt-4 text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            View
            <ChevronRight className="size-4" aria-hidden />
          </p>
        </div>
      </Card>
    </Link>
  );
}
