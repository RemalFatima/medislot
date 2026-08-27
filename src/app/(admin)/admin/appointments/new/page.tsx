import Link from "next/link";
import { requireStaff } from "@/server/auth/requireStaff";
import {
  bookingDateBounds,
  clampBookingDate,
  getAvailableSlots,
} from "@/server/appointments/slots";
import { getDoctorById, listDoctors } from "@/server/catalog/doctors";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { WalkInFilters } from "@/components/admin/walk-in-filters";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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
  const doctor = selectedDoctor?.is_active
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
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm text-muted">
        <Link href="/admin/appointments" className="hover:text-foreground">
          Appointments
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-foreground">Walk-in</span>
      </p>
      <PageHeader
        title="Walk-in"
        description="Uses the same booking lock as online bookings. Confirmed instantly."
      />

      {doctors.length === 0 ? (
        <EmptyState
          title="No active doctors with services"
          description="Add an active doctor and assign a service before creating a walk-in."
          action={
            <Link href="/admin/doctors" className={buttonClass({ variant: "secondary" })}>
              Go to doctors
            </Link>
          }
        />
      ) : (
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">Doctor, service, and date</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Times update when you press Show times.
          </p>
          <WalkInFilters
            doctors={doctors}
            services={doctor?.services ?? []}
            selectedDoctorId={doctor?.id ?? ""}
            selectedServiceId={selectedService?.id ?? ""}
            today={today}
            maxDate={maxDate}
            date={date}
          />
          {doctor && selectedService ? (
            <WalkInForm
              doctorId={doctor.id}
              serviceId={selectedService.id}
              timezone={timezone}
              slots={slots}
            />
          ) : (
            <EmptyState
              className="mt-6"
              title="This doctor has no services assigned"
              description="Assign a service to the doctor, then return to create a walk-in."
            />
          )}
        </Card>
      )}
    </main>
  );
}
