import { notFound } from "next/navigation";
import { getDoctorBySlug } from "@/server/catalog/doctors";
import { listDoctorAvailability } from "@/server/scheduling/availability";
import {
  timeInputValue,
  WEEKDAYS,
} from "@/server/scheduling/constants";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";

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

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex gap-5">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-xl font-semibold text-zinc-500">
          {doctor.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.photo_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            doctor.full_name.slice(0, 1)
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            {doctor.full_name}
          </h1>
          <p className="mt-1 text-zinc-600">
            {doctor.profession}
            {doctor.specialization ? ` · ${doctor.specialization}` : ""}
          </p>
          {doctor.departments.length > 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              {doctor.departments.map((department) => department.name).join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      {doctor.bio ? (
        <p className="mt-8 whitespace-pre-wrap text-zinc-700">{doctor.bio}</p>
      ) : null}

      <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
        {doctor.qualifications ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <dt className="text-zinc-500">Qualifications</dt>
            <dd className="mt-1 text-zinc-900">{doctor.qualifications}</dd>
          </div>
        ) : null}
        {doctor.experience_years !== null ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <dt className="text-zinc-500">Experience</dt>
            <dd className="mt-1 text-zinc-900">{doctor.experience_years} years</dd>
          </div>
        ) : null}
        {doctor.consultation_fee !== null ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <dt className="text-zinc-500">Consultation fee</dt>
            <dd className="mt-1 text-zinc-900">{doctor.consultation_fee}</dd>
          </div>
        ) : null}
      </dl>

      {windows.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-950">Weekly hours</h2>
          <p className="mt-1 text-sm text-zinc-500">Times in {timezone}</p>
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {WEEKDAYS.map((day) => {
              const dayWindows = windows.filter(
                (window) => window.weekday === day.value,
              );
              if (dayWindows.length === 0) {
                return null;
              }

              return (
                <li
                  key={day.value}
                  className="flex justify-between px-4 py-3 text-sm"
                >
                  <span className="text-zinc-900">{day.label}</span>
                  <span className="text-zinc-500">
                    {dayWindows
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
        </section>
      ) : null}

      {doctor.services.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-950">Services</h2>
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {doctor.services.map((service) => (
              <li key={service.id} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-zinc-900">{service.name}</span>
                <span className="text-zinc-500">{service.duration_minutes} min</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
