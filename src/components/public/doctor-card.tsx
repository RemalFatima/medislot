import Link from "next/link";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { Card } from "@/components/ui/card";

export function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  return (
    <Link href={`/doctors/${doctor.slug}`} className="block h-full">
      <Card className="flex h-full gap-4 p-4 transition-colors hover:border-primary/30">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent text-sm font-semibold text-primary">
          {doctor.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.photo_url}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initials(doctor.full_name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{doctor.full_name}</p>
          <p className="mt-0.5 text-sm text-muted">
            {doctor.profession}
            {doctor.specialization ? ` · ${doctor.specialization}` : ""}
          </p>
          {doctor.departments.length > 0 ? (
            <p className="mt-1 truncate text-xs text-muted">
              {doctor.departments.map((department) => department.name).join(", ")}
            </p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-primary">View profile</p>
        </div>
      </Card>
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
