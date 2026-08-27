import Link from "next/link";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card className="flex h-full flex-col overflow-hidden p-0 transition-[transform,border-color,box-shadow] motion-safe:hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-(--shadow-card)">
      <div className="h-1.5 bg-primary" />
      <div className="flex flex-1 flex-col bg-linear-to-b from-accent/30 to-surface p-5">
        <div className="flex gap-4">
          <div className="flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent ring-1 ring-primary/10 text-sm font-semibold text-primary">
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
            <h2 className="font-semibold text-foreground">
              <Link href={`/doctors/${doctor.slug}`} className="hover:text-primary">
                {doctor.full_name}
              </Link>
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {doctor.profession}
              {doctor.specialization ? ` · ${doctor.specialization}` : ""}
            </p>
            {doctor.departments.length > 0 ? (
              <p className="mt-2 text-xs text-muted">
                {doctor.departments.map((department, index) => (
                  <span key={department.id}>
                    {index > 0 ? ", " : null}
                    <Link
                      href={`/departments/${department.slug}`}
                      className="hover:text-foreground"
                    >
                      {department.name}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
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
