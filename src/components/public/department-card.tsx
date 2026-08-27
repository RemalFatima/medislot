import Link from "next/link";
import type { Department } from "@/server/catalog/departments";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    <Link href={`/departments/${department.slug}`} className="block h-full rounded-xl">
      <Card className="flex h-full flex-col p-5 transition-colors hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">
            {department.name}
          </h3>
          <Badge tone="primary">{doctorCountLabel(doctorCount)}</Badge>
        </div>
        {department.description ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted">
            {department.description}
          </p>
        ) : (
          <p className="mt-2 flex-1 text-sm text-muted">
            View doctors in this department.
          </p>
        )}
        <p className="mt-4 text-sm font-medium text-primary">View department</p>
      </Card>
    </Link>
  );
}
