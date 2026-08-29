import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Department } from "@/server/catalog/departments";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { Badge } from "@/components/ui/badge";
import { Card, cardLiftClass } from "@/components/ui/card";

export function countDoctorsByDepartment(
  doctors: DoctorListItem[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const doctor of doctors) {
    const seen = new Set<string>();
    for (const department of doctor.departments) {
      if (seen.has(department.id)) {
        continue;
      }
      seen.add(department.id);
      counts.set(department.id, (counts.get(department.id) ?? 0) + 1);
    }
  }

  return counts;
}

function doctorCountLabel(count: number) {
  if (count === 1) {
    return "1 doctor";
  }
  return `${count} doctors`;
}

export function DepartmentCard({
  department,
  doctorCount = 0,
}: {
  department: Department;
  doctorCount?: number;
}) {
  return (
    <Link href={`/departments/${department.slug}`} className="group block h-full rounded-2xl">
      <Card className={`flex h-full flex-col overflow-hidden rounded-2xl p-0 ${cardLiftClass}`}>
        <div className="h-1.5 bg-primary" />
        <div className="flex flex-1 flex-col bg-linear-to-b from-accent/45 to-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-base font-semibold tracking-wide text-primary ring-2 ring-white">
              {department.name.slice(0, 1).toUpperCase()}
            </span>
            <Badge tone="primary">{doctorCountLabel(doctorCount)}</Badge>
          </div>
          <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
            {department.name}
          </h3>
          {department.description ? (
            <p className="mt-2 line-clamp-3 min-h-16 flex-1 text-sm leading-6 text-muted">
              {department.description}
            </p>
          ) : (
            <p className="mt-2 min-h-16 flex-1 text-sm leading-6 text-muted">
              View doctors in this department.
            </p>
          )}
          <p className="mt-4 inline-flex items-center gap-1 border-t border-border pt-3 text-sm font-semibold text-primary">
            View department
            <ChevronRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </p>
        </div>
      </Card>
    </Link>
  );
}
