import Link from "next/link";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDoctors } from "@/server/catalog/doctors";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const doctors = await listDoctors();

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Doctors
        </h1>
        {canManage ? (
          <Link
            href="/admin/doctors/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add doctor
          </Link>
        ) : null}
      </div>
      {doctors.length === 0 ? (
        <p className="text-sm text-zinc-600">No doctors yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {doctors.map((doctor) => (
            <li key={doctor.id}>
              <Link
                href={`/admin/doctors/${doctor.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium text-zinc-950">{doctor.full_name}</p>
                  <p className="text-xs text-zinc-500">
                    {doctor.profession}
                    {doctor.specialization ? ` · ${doctor.specialization}` : ""}
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {doctor.is_active ? "Active" : "Hidden"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
