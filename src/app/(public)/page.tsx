import Link from "next/link";
import {
  CalendarCheck,
  CalendarDays,
  CircleCheck,
  Clock3,
  FolderKanban,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { listDepartments } from "@/server/catalog/departments";
import { listDoctors } from "@/server/catalog/doctors";
import {
  countDoctorsByDepartment,
  DepartmentCard,
} from "@/components/public/department-card";
import { DoctorCard } from "@/components/public/doctor-card";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicOrganization } from "@/server/tenant/getPublicOrganization";
import { APP_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

const bookingSteps = [
  {
    icon: Stethoscope,
    title: "Find the right doctor",
    text: "Browse departments and doctor profiles to choose who you want to see.",
  },
  {
    icon: CalendarDays,
    title: "Choose a convenient time",
    text: "Pick a date and an available appointment slot that fits your schedule.",
  },
  {
    icon: UserRound,
    title: "Book your appointment easily",
    text: "Enter your name and phone number. You do not need to create an account.",
  },
];

const reasons = [
  {
    icon: CalendarCheck,
    title: "Real availability",
    text: "Appointment times come from the clinic’s published schedule, not a generic calendar.",
  },
  {
    icon: UserRound,
    title: "No patient login",
    text: "Book as a guest with your name and phone. Staff manage the rest from the clinic console.",
  },
  {
    icon: CircleCheck,
    title: "Clear confirmation",
    text: "After booking you receive a confirmation page you can save or return to later.",
  },
  {
    icon: FolderKanban,
    title: "Clinic-managed catalog",
    text: "Departments, doctors, and services are maintained by the clinic, so the public site stays current.",
  },
];

export default async function Home() {
  const [organization, departments, doctors] = await Promise.all([
    getPublicOrganization(),
    listDepartments({ activeOnly: true }),
    listDoctors({ activeOnly: true }),
  ]);
  const clinicName = APP_NAME;
  const doctorCounts = countDoctorsByDepartment(doctors);
  const featuredDepartments = departments.slice(0, 6);
  const featuredDoctors = doctors.slice(0, 6);
  const contactLine = [organization?.phone, organization?.city, organization?.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-accent">
        <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-medium text-primary">{clinicName}</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
              {organization?.branding.tagline ??
                "Find the right doctor, choose a convenient time, and book easily"}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              {organization?.branding.description ??
                "Browse departments and doctor profiles, pick an available slot, and confirm your visit in a few steps."}
            </p>
            {contactLine ? (
              <p className="mt-3 text-sm text-muted">{contactLine}</p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/doctors" className={buttonClass()}>
                Find a doctor
              </Link>
              <Link href="/departments" className={buttonClass({ variant: "secondary" })}>
                Browse departments
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-foreground">How booking works</p>
            <ol className="mt-4 space-y-3">
              {bookingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.title}
                    className="flex gap-3 rounded-xl border border-border bg-linear-to-r from-accent/70 to-surface px-3 py-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span className="mr-1.5 text-xs font-semibold tabular-nums text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">{step.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading
            eyebrow="Care areas"
            title="Departments"
            description="Start with the care area you need, then choose a doctor."
            href="/departments"
          />
          {featuredDepartments.length === 0 ? (
            <EmptyState
              title="No departments published yet"
              description="The clinic has not listed departments on this site yet."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredDepartments.map((department) => (
                <li key={department.id}>
                  <DepartmentCard
                    department={department}
                    doctorCount={doctorCounts.get(department.id) ?? 0}
                  />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="border-y border-border bg-surface py-14 sm:py-16">
        <Container>
          <SectionHeading
            eyebrow="Clinicians"
            title="Doctors"
            description="Profiles published by the clinic. Book from a doctor’s page when you are ready."
            href="/doctors"
          />
          {featuredDoctors.length === 0 ? (
            <EmptyState
              title="No doctors published yet"
              description="Doctor profiles will appear here once the clinic adds them."
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {featuredDoctors.map((doctor) => (
                <li key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Booking
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Book in three steps
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            The public booking flow stays on one page. These steps are just to make the path clear.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {bookingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title}>
                  <Card className="h-full overflow-hidden p-0 transition-[transform,border-color,box-shadow] motion-safe:hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                    <div className="h-1.5 bg-primary" />
                    <div className="flex h-full flex-col bg-linear-to-b from-accent/40 to-surface p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-card)]">
                          <Icon className="size-6" aria-hidden />
                        </span>
                        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold tabular-nums text-primary ring-1 ring-primary/15">
                          Step {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mt-5 text-base font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-14 sm:py-16">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Why {clinicName}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Why book with {clinicName}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Built for outpatient visits: discover a doctor, pick a time, and confirm.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <li key={reason.title}>
                  <Card className="h-full overflow-hidden p-0 transition-[transform,border-color,box-shadow] motion-safe:hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                    <div className="flex h-full gap-4 border-l-[3px] border-primary p-5">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary ring-1 ring-primary/10">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">{reason.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-muted">{reason.text}</p>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="rounded-2xl bg-primary-hover px-6 py-10 sm:px-10">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-white" aria-hidden />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-primary-foreground">
                  Ready to book a visit?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                  Choose a doctor, select an available time, and confirm your appointment online.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/doctors" className={buttonClass({ variant: "inverse" })}>
                    Browse doctors
                  </Link>
                  <Link
                    href="/departments"
                    className={buttonClass({ variant: "inverseSecondary" })}
                  >
                    View departments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={
            eyebrow
              ? "mt-2 text-2xl font-semibold tracking-tight text-foreground"
              : "text-2xl font-semibold tracking-tight text-foreground"
          }
        >
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      <Link href={href} className="shrink-0 text-sm font-medium text-primary hover:text-primary-hover">
        View all<span className="sr-only"> {title}</span>
      </Link>
    </div>
  );
}
