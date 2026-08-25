import { notFound } from "next/navigation";
import { getBookingByToken } from "@/server/appointments/book";

export const dynamic = "force-dynamic";

function formatWhen(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
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

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12">
      <p className="text-sm font-medium text-emerald-800">Appointment confirmed</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
        You&apos;re booked
      </h1>
      <dl className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        <div className="px-4 py-3">
          <dt className="text-xs text-zinc-500">Confirmation code</dt>
          <dd className="mt-1 font-mono text-sm text-zinc-950">
            {booking.confirmation_token}
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-zinc-500">When</dt>
          <dd className="mt-1 text-sm text-zinc-950">
            {formatWhen(booking.start_at, booking.timezone)}
            <span className="block text-zinc-500">{booking.timezone}</span>
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-zinc-500">Doctor</dt>
          <dd className="mt-1 text-sm text-zinc-950">{booking.doctor_name}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-zinc-500">Service</dt>
          <dd className="mt-1 text-sm text-zinc-950">{booking.service_name}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-zinc-500">Name</dt>
          <dd className="mt-1 text-sm text-zinc-950">{booking.patient_name}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-zinc-500">Clinic</dt>
          <dd className="mt-1 text-sm text-zinc-950">
            {booking.organization_name}
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-zinc-600">
        Save this confirmation code. Staff can look up the visit with it.
      </p>
    </main>
  );
}
