import Link from "next/link";
import { CalendarDays, Clock3, Stethoscope, UserRound } from "lucide-react";
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
    title: "Real availability",
    text: "Appointment times come from the clinic’s published schedule, not a generic calendar.",
  },
  {
    title: "No patient login",
    text: "Book as a guest with your name and phone. Staff manage the rest from the clinic console.",
  },
  {
    title: "Clear confirmation",
    text: "After booking you receive a confirmation page you can save or return to later.",
  },
  {
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
  const clinicName = organization?.name ?? "MediSlot";
  const doctorCounts = countDoctorsByDepartment(doctors);
  const featuredDepartments = departments.slice(0, 6);
  const featuredDoctors = doctors.slice(0, 6);
  const contactLine = [organization?.phone, organization?.city, organization?.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-surface">
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

          <div className="rounded-2xl border border-border bg-surface-muted p-5">
            <p className="text-sm font-medium text-foreground">How booking works</p>
            <ol className="mt-4 space-y-3">
              {bookingSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading
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
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Book in three steps
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            The public booking flow stays on one page. These steps are just to make the path clear.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {bookingSteps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title}>
                  <Card className="h-full p-5">
                    <Icon className="size-5 text-primary" aria-hidden />
                    <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                  </Card>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-14 sm:py-16">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Why book with {clinicName}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Built for outpatient visits: discover a doctor, pick a time, and confirm.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => (
              <li
                key={reason.title}
                className="rounded-xl border border-border bg-background p-5"
              >
                <h3 className="font-semibold text-foreground">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{reason.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="rounded-2xl border border-border bg-accent px-6 py-10 sm:px-10">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Ready to book a visit?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  Choose a doctor, select an available time, and confirm your appointment online.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/doctors" className={buttonClass()}>
                    Browse doctors
                  </Link>
                  <Link href="/departments" className={buttonClass({ variant: "secondary" })}>
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
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      <Link href={href} className="shrink-0 text-sm font-medium text-primary hover:text-primary-hover">
        View all
      </Link>
    </div>
  );
}
