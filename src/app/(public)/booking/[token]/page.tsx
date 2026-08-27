import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { getBookingByToken } from "@/server/appointments/book";
import { APPOINTMENT_STATUS_LABELS } from "@/server/appointments/labels";
import { BookingSteps } from "@/components/public/booking-steps";
import { CopyReference } from "@/components/public/copy-reference";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

function formatDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking) {
    notFound();
  }

  const rows = [
    { label: "Doctor", value: booking.doctor_name },
    { label: "Service", value: booking.service_name },
    { label: "Date", value: formatDate(booking.start_at, booking.timezone) },
    {
      label: "Time",
      value: `${formatTime(booking.start_at, booking.timezone)} (${booking.timezone.replace(/_/g, " ")})`,
    },
    { label: "Patient", value: booking.patient_name },
    { label: "Clinic", value: booking.organization_name },
  ];

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-accent">
        <Container className="max-w-xl py-10 sm:py-12">
          <BookingSteps current={6} className="mb-0" />
        </Container>
      </section>

      <Container className="max-w-xl py-10 sm:py-12">
        <Card className="overflow-hidden p-0">
          <div className="h-1.5 bg-primary" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                <CircleCheck className="size-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-success">
                    Appointment confirmed
                  </p>
                  <Badge tone="success">
                    {APPOINTMENT_STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  You&apos;re booked
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Your visit is reserved. Save this page or copy the confirmation
                  code so you can find the appointment later.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-accent/50 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    Confirmation code
                  </p>
                  <p className="mt-1 break-all font-mono text-sm text-foreground">
                    {booking.confirmation_token}
                  </p>
                </div>
                <CopyReference value={booking.confirmation_token} />
              </div>
            </div>

            <dl className="mt-6 divide-y divide-border rounded-xl border border-border">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <dt className="text-sm text-muted">{row.label}</dt>
                  <dd className="text-sm font-medium text-foreground sm:text-right">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>

        <div className="mt-6 rounded-xl border border-border bg-surface px-5 py-5">
          <h2 className="font-semibold text-foreground">What to do next</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            <li>Keep the confirmation code. Clinic staff can look up your visit with it.</li>
            <li>Arrive a little early on the appointment date.</li>
            <li>
              If you need to change or cancel, contact the clinic directly. This
              page cannot reschedule the visit.
            </li>
          </ul>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href="/" className={buttonClass({ className: "w-full sm:w-auto" })}>
              Back to home
            </Link>
            <Link
              href="/doctors"
              className={buttonClass({
                variant: "secondary",
                className: "w-full sm:w-auto",
              })}
            >
              Browse doctors
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
