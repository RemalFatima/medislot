import Link from "next/link";
import { requireStaff } from "@/server/auth/requireStaff";
import {
  bookingDateBounds,
  clampBookingDate,
  getAvailableSlots,
} from "@/server/appointments/slots";
import { getDoctorById, listDoctors } from "@/server/catalog/doctors";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { fieldClass } from "@/components/ui/field";
import { WalkInForm } from "../walk-in-form";

export const dynamic = "force-dynamic";

export default async function NewWalkInPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string; service?: string; date?: string }>;
}) {
  await requireStaff();
  const filters = await searchParams;
  const timezone = await getOrganizationTimezone();
  const { today, maxDate } = bookingDateBounds(timezone);
  const date = clampBookingDate(filters.date, timezone);
  const doctors = await listDoctors({ activeOnly: true });
  const selectedDoctor = filters.doctor
    ? await getDoctorById(filters.doctor)
    : null;
  const doctor =
    selectedDoctor?.is_active
      ? selectedDoctor
      : doctors[0]
        ? await getDoctorById(doctors[0].id)
        : null;
  const selectedService =
    doctor?.services.find((service) => service.id === filters.service) ??
    doctor?.services[0];
  const slots =
    doctor && selectedService
      ? await getAvailableSlots({
          doctorId: doctor.id,
          serviceId: selectedService.id,
          date,
        })
      : [];

  return (
    <main className="px-6 py-8">
      <p className="text-sm text-zinc-500">
        <Link href="/admin/appointments" className="hover:text-zinc-900">
          ← Appointments
        </Link>
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
        Walk-in
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Uses the same booking lock as online bookings. Instantly confirmed.
      </p>

      {doctors.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">
          Add an active doctor with a service before creating a walk-in.
        </p>
      ) : (
        <>
          <form className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-zinc-800">Doctor</span>
              <select
                name="doctor"
                defaultValue={doctor?.id ?? ""}
                className={`${fieldClass} w-full`}
              >
                {doctors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-zinc-800">Service</span>
              <select
                name="service"
                defaultValue={selectedService?.id ?? ""}
                className={`${fieldClass} w-full`}
              >
                {(doctor?.services ?? []).map((service) => (
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
                className="h-11 w-full rounded-md border border-zinc-300 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                Show times
              </button>
            </div>
          </form>

          {doctor && selectedService ? (
            <WalkInForm
              doctorId={doctor.id}
              serviceId={selectedService.id}
              timezone={timezone}
              slots={slots}
            />
          ) : (
            <p className="mt-6 text-sm text-zinc-600">
              This doctor has no services assigned.
            </p>
          )}
        </>
      )}
    </main>
  );
}
