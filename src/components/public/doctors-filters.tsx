import Link from "next/link";
import type { Department } from "@/server/catalog/departments";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fieldClass } from "@/components/ui/field";

export type DoctorFilters = {
  q?: string;
  department?: string;
  profession?: string;
  specialization?: string;
};

export function DoctorsFilters({
  departments,
  professions,
  specializations,
  filters,
}: {
  departments: Department[];
  professions: string[];
  specializations: string[];
  filters: DoctorFilters;
}) {
  const hasFilters = Boolean(
    filters.q || filters.department || filters.profession || filters.specialization,
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="h-1.5 bg-primary" />
      <div className="bg-linear-to-b from-accent/30 to-surface p-4 sm:p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Find a doctor</p>
        <form
          action="/doctors"
          method="get"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12"
        >
        <label className="min-w-0 sm:col-span-2 lg:col-span-12">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Doctor name, profession, or department"
            className={fieldClass}
          />
        </label>
        <label className="min-w-0 lg:col-span-3">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Department
          </span>
          <select
            name="department"
            defaultValue={filters.department ?? ""}
            className={fieldClass}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.slug}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 lg:col-span-3">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Profession
          </span>
          <select
            name="profession"
            defaultValue={filters.profession ?? ""}
            className={fieldClass}
          >
            <option value="">All professions</option>
            {professions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 lg:col-span-3">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Specialization
          </span>
          <select
            name="specialization"
            defaultValue={filters.specialization ?? ""}
            className={fieldClass}
          >
            <option value="">All specializations</option>
            {specializations.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 lg:col-span-3">
          <button type="submit" className={buttonClass({ className: "w-full" })}>
            Apply filters
          </button>
        </div>
      </form>
      {hasFilters ? (
        <p className="mt-3">
          <Link href="/doctors" className="text-sm font-medium text-primary hover:text-primary-hover">
            Clear filters
          </Link>
        </p>
      ) : null}
      </div>
    </Card>
  );
}
