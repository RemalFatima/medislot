import Link from "next/link";
import { CatalogPageHero } from "@/components/admin/catalog-page-hero";
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
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Front desk"
        title="New walk-in"
        description="Book a patient who is already at the clinic. Same slot lock as online booking, confirmed instantly."
        breadcrumb={
          <Breadcrumb
            items={[
              { href: "/admin/appointments", label: "Appointments" },
              { label: "Walk-in" },
            ]}
          />
        }
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
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
          <Card className="overflow-hidden p-0">
            <div className="h-1.5 bg-primary" />
            <div className="bg-linear-to-b from-accent/40 to-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                  1
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-foreground">
                    Visit details
                  </h2>
                  <p className="mt-1 mb-4 text-sm text-muted">
                    Choose the doctor, service, and date, then press Show times.
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
                </div>
              </div>
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
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
