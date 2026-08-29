import Link from "next/link";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, cardLiftClass } from "@/components/ui/card";

export function doctorInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  return (
    <Card className={`flex h-full flex-col overflow-hidden rounded-2xl p-0 ${cardLiftClass}`}>
      <div className="h-1.5 bg-primary" />
      <div className="flex flex-1 flex-col bg-linear-to-b from-accent/35 to-surface p-5">
        <div className="flex gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent text-sm font-semibold tracking-wide text-primary ring-2 ring-white">
            {doctor.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doctor.photo_url}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              doctorInitials(doctor.full_name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold tracking-tight text-foreground">
              <Link href={`/doctors/${doctor.slug}`} className="hover:text-primary">
                {doctor.full_name}
              </Link>
            </h2>
            <p className="mt-1">
              <Badge tone="primary">
                {doctor.profession}
                {doctor.specialization ? ` · ${doctor.specialization}` : ""}
              </Badge>
            </p>
            {doctor.departments.length > 0 ? (
              <p className="mt-2.5 flex flex-wrap gap-1.5">
                {doctor.departments.slice(0, 3).map((department) => (
                  <Link key={department.id} href={`/departments/${department.slug}`}>
                    <Badge tone="neutral">{department.name}</Badge>
                  </Link>
                ))}
                {doctor.departments.length > 3 ? (
                  <Badge tone="neutral">+{doctor.departments.length - 3}</Badge>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
          <Link
            href={`/doctors/${doctor.slug}`}
            className={buttonClass({
              variant: "secondary",
              className: "w-full sm:flex-1",
            })}
          >
            View profile
          </Link>
          <Link
            href={`/doctors/${doctor.slug}/book`}
            className={buttonClass({ className: "w-full sm:flex-1" })}
          >
            Book appointment
          </Link>
        </div>
      </div>
    </Card>
  );
}
