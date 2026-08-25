import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDoctors } from "@/server/catalog/doctors";
import {
  exceptionTypeLabel,
  timeInputValue,
} from "@/server/scheduling/constants";
import { listExceptions } from "@/server/scheduling/exceptions";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { DeleteExceptionButton } from "./delete-exception-button";
import { ExceptionForm } from "./exception-form";

export const dynamic = "force-dynamic";

export default async function AdminHolidaysPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const [exceptions, doctors, timezone] = await Promise.all([
    listExceptions(),
    listDoctors(),
    getOrganizationTimezone(),
  ]);
  const doctorNameById = new Map(
    doctors.map((doctor) => [doctor.id, doctor.full_name]),
  );

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Holidays & exceptions
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Clinic-wide dates apply to every doctor. Times are in {timezone}.
      </p>

      {canManage ? (
        <ExceptionForm
          key={exceptions.map((exception) => exception.id).join()}
          doctors={doctors}
        />
      ) : null}

      {exceptions.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">No exceptions yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {exceptions.map((exception) => (
            <li
              key={exception.id}
              className="flex items-start justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="font-medium text-zinc-950">
                  {exception.date} · {exceptionTypeLabel(exception.type)}
                </p>
                <p className="text-xs text-zinc-500">
                  {exception.doctor_id
                    ? (doctorNameById.get(exception.doctor_id) ?? "Doctor")
                    : "Clinic-wide"}
                  {exception.start_time && exception.end_time
                    ? ` · ${timeInputValue(exception.start_time)}–${timeInputValue(exception.end_time)}`
                    : " · all day"}
                </p>
                {exception.reason ? (
                  <p className="mt-1 text-sm text-zinc-600">{exception.reason}</p>
                ) : null}
              </div>
              {canManage ? <DeleteExceptionButton id={exception.id} /> : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
