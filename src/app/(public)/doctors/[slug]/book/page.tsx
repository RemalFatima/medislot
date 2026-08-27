import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctorBySlug } from "@/server/catalog/doctors";
import {
  bookingDateBounds,
  clampBookingDate,
  getAvailableSlots,
} from "@/server/appointments/slots";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { doctorInitials } from "@/components/public/doctor-card";
import { BookingFilters } from "@/components/public/booking-filters";
import { BookingSteps } from "@/components/public/booking-steps";
import { buttonClass } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { BookForm } from "./book-form";

export const dynamic = "force-dynamic";

function formatCalendarDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default async function BookDoctorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string; date?: string }>;
}) {
  const { slug } = await params;
  const filters = await searchParams;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const timezone = await getOrganizationTimezone();
  const { today, maxDate } = bookingDateBounds(timezone);
  const date = clampBookingDate(filters.date, timezone);
  const selectedService =
    doctor.services.find((service) => service.id === filters.service) ??
    doctor.services[0];

  const slots =
    selectedService != null
      ? await getAvailableSlots({
          doctorId: doctor.id,
          serviceId: selectedService.id,
          date,
        })
      : [];

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-accent">
        <Container className="max-w-4xl py-10 sm:py-12">
          <Breadcrumb
            items={[
              { href: `/doctors/${doctor.slug}`, label: doctor.full_name },
              { label: "Book" },
            ]}
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Booking
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Book an appointment
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Choose a service and date, pick an available time, then enter your
            details. Your appointment is confirmed instantly if the slot is still
            free.
          </p>
          <BookingSteps current={4} className="mb-0 mt-8" />
        </Container>
      </section>

      <Container className="max-w-4xl py-10 sm:py-12">
        {doctor.services.length === 0 || !selectedService ? (
          <EmptyState
            title="This doctor has no bookable services yet"
            description="Online booking will be available once the clinic assigns a service."
            action={
              <Link
                href={`/doctors/${doctor.slug}`}
                className={buttonClass({ variant: "secondary" })}
              >
                Back to profile
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <aside className="lg:col-start-2">
              <Card className="overflow-hidden p-0 lg:sticky lg:top-24">
                <div className="h-1.5 bg-primary" />
                <div className="bg-linear-to-b from-accent/40 to-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Your booking
                  </p>
                  <div className="mt-4 flex gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent text-sm font-semibold text-primary ring-1 ring-primary/10">
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
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{doctor.full_name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {doctor.profession}
                        {doctor.specialization ? ` · ${doctor.specialization}` : ""}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-5 space-y-3 text-sm">
                    {doctor.departments.length > 0 ? (
                      <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
                        <dt className="text-xs text-muted">Department</dt>
                        <dd className="mt-0.5 font-medium text-foreground">
                          {doctor.departments
                            .map((department) => department.name)
                            .join(", ")}
                        </dd>
                      </div>
                    ) : null}
                    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
                      <dt className="text-xs text-muted">Service</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {selectedService.name} · {selectedService.duration_minutes} min
                      </dd>
                    </div>
                    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
                      <dt className="text-xs text-muted">Date</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {formatCalendarDate(date)}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
                      <dt className="text-xs text-muted">Timezone</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {timezone.replace(/_/g, " ")}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/doctors/${doctor.slug}`}
                    className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    View profile
                  </Link>
                </div>
              </Card>
            </aside>

            <div className="lg:col-start-1 lg:row-start-1">
              <Card className="overflow-hidden p-0">
                <div className="h-1.5 bg-primary" />
                <div className="p-5 sm:p-6">
                  <h2 className="text-base font-semibold text-foreground">
                    Service and date
                  </h2>
                  <p className="mt-1 mb-4 text-sm text-muted">
                    Times update when you press Show times.
                  </p>
                  <BookingFilters
                    action={`/doctors/${doctor.slug}/book`}
                    services={doctor.services}
                    selectedServiceId={selectedService.id}
                    today={today}
                    maxDate={maxDate}
                    date={date}
                  />
                  <BookForm
                    doctorId={doctor.id}
                    serviceId={selectedService.id}
                    timezone={timezone}
                    slots={slots}
                  />
                </div>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
