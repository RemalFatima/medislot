import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctorBySlug } from "@/server/catalog/doctors";
import {
  bookingDateBounds,
  clampBookingDate,
  getAvailableSlots,
} from "@/server/appointments/slots";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { fieldClass } from "@/components/ui/field";
import { BookForm } from "./book-form";

export const dynamic = "force-dynamic";

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
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <p className="text-sm text-zinc-500">
        <Link href={`/doctors/${doctor.slug}`} className="hover:text-zinc-900">
          ← {doctor.full_name}
        </Link>
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
        Book an appointment
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Guest booking — name and phone only. Confirmed instantly if the slot is
        free.
      </p>

      {doctor.services.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">
          This doctor has no bookable services yet.
        </p>
      ) : (
        <>
          <form className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-zinc-800">Service</span>
              <select
                name="service"
                defaultValue={selectedService.id}
                className={`${fieldClass} w-full`}
              >
                {doctor.services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration_minutes} min)
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-zinc-800">Date</span>
              <input
                type="date"
                name="date"
                min={today}
                max={maxDate}
                defaultValue={date}
                className={`${fieldClass} w-full`}
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="h-11 w-full rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                Show times
              </button>
            </div>
          </form>

          <BookForm
            doctorId={doctor.id}
            serviceId={selectedService.id}
            timezone={timezone}
            slots={slots}
          />
        </>
      )}
    </main>
  );
}
