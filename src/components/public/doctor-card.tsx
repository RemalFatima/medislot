import Link from "next/link";
import type { DoctorListItem } from "@/server/catalog/doctors";

export function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-500">
        {doctor.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doctor.photo_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials(doctor.full_name)
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-zinc-950">{doctor.full_name}</p>
        <p className="text-sm text-zinc-600">
          {doctor.profession}
          {doctor.specialization ? ` · ${doctor.specialization}` : ""}
        </p>
        {doctor.departments.length > 0 ? (
          <p className="mt-1 truncate text-xs text-zinc-500">
            {doctor.departments.map((department) => department.name).join(", ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
