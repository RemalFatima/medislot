import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctorBySlug } from "@/server/catalog/doctors";
import { listDoctorAvailability } from "@/server/scheduling/availability";
import { timeInputValue, WEEKDAYS } from "@/server/scheduling/constants";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { doctorInitials } from "@/components/public/doctor-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const [windows, timezone] = await Promise.all([
    listDoctorAvailability(doctor.id),
    getOrganizationTimezone(),
  ]);

  const canBook = doctor.services.length > 0;
  const bookHref = `/doctors/${doctor.slug}/book`;
  const details = [
    doctor.qualifications
      ? { label: "Qualifications", value: doctor.qualifications }
      : null,
    doctor.experience_years !== null
      ? { label: "Experience", value: `${doctor.experience_years} years` }
      : null,
    doctor.consultation_fee !== null
      ? { label: "Consultation fee", value: String(doctor.consultation_fee) }
      : null,
  ].filter((item): item is { label: string; value: string } => item != null);

  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container className="max-w-4xl">
        <Breadcrumb
          items={[
            { href: "/doctors", label: "Doctors" },
            { label: doctor.full_name },
          ]}
        />

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent text-2xl font-semibold text-primary">
              {doctor.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor.photo_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                doctorInitials(doctor.full_name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {doctor.full_name}
              </h1>
              <p className="mt-1 text-muted">
                {doctor.profession}
                {doctor.specialization ? ` · ${doctor.specialization}` : ""}
              </p>
              {doctor.departments.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {doctor.departments.map((department) => (
                    <li key={department.id}>
                      <Link href={`/departments/${department.slug}`}>
                        <Badge tone="primary">{department.name}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {canBook ? (
              <Link
                href={bookHref}
                className={buttonClass({ className: "w-full shrink-0 sm:w-auto" })}
              >
                Book appointment
              </Link>
            ) : null}
          </div>
        </Card>

        {doctor.bio ? (
          <section className="mt-6">
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">About</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">
                {doctor.bio}
              </p>
            </Card>
          </section>
        ) : null}

        {details.length > 0 ? (
          <section className="mt-6">
            <dl className="grid gap-3 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label}>
                  <Card className="h-full px-4 py-3">
                    <dt className="text-sm text-muted">{item.label}</dt>
                    <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
                  </Card>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className="mt-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">Weekly hours</h2>
            <p className="mt-1 text-sm text-muted">Times shown in {timezone}.</p>
            {windows.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                Weekly hours have not been published for this doctor yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                {WEEKDAYS.map((day) => {
                  const dayWindows = windows.filter(
                    (window) => window.weekday === day.value,
                  );

                  return (
                    <li
                      key={day.value}
                      className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-foreground">{day.label}</span>
                      <span className="text-muted">
                        {dayWindows.length === 0
                          ? "Not scheduled"
                          : dayWindows
                              .map(
                                (window) =>
                                  `${timeInputValue(window.start_time)}–${timeInputValue(window.end_time)}`,
                              )
                              .join(", ")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        <section className="mt-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Services</h2>
                <p className="mt-1 text-sm text-muted">
                  Choose a service when you book.
                </p>
              </div>
              {canBook ? (
                <Link
                  href={bookHref}
                  className={buttonClass({ className: "w-full sm:w-auto" })}
                >
                  Book appointment
                </Link>
              ) : null}
            </div>
            {doctor.services.length === 0 ? (
              <EmptyState
                className="mt-4"
                title="No bookable services yet"
                description="This doctor does not have services assigned for online booking."
              />
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                {doctor.services.map((service) => (
                  <li
                    key={service.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {service.duration_minutes} min
                        {service.price !== null ? ` · ${service.price}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/doctors/${doctor.slug}/book?service=${service.id}`}
                      className={buttonClass({
                        variant: "secondary",
                        size: "sm",
                        className: "w-full shrink-0 sm:w-auto",
                      })}
                    >
                      Book this service
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </Container>
    </main>
  );
}
