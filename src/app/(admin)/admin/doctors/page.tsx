import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { CatalogPreviewCard } from "@/components/admin/catalog-preview";
import { CatalogSearch } from "@/components/admin/catalog-search";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDoctors } from "@/server/catalog/doctors";
import { buttonClass } from "@/components/ui/button";
import { Card, cardGridHoverClass } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const query = (await searchParams).q?.trim() || undefined;
  const doctors = await listDoctors();
  const visible = query
    ? doctors.filter((doctor) => {
        const haystack = [
          doctor.full_name,
          doctor.profession,
          doctor.specialization ?? "",
          ...doctor.departments.map((department) => department.name),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : doctors;
  const countLabel = visible.length === 1 ? "1 doctor" : `${visible.length} doctors`;

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Catalog"
        title="Doctors"
        description="Profiles, departments, services, and weekly hours."
        actions={
          canManage ? (
            <Link href="/admin/doctors/new" className={buttonClass()}>
              Add doctor
            </Link>
          ) : null
        }
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden p-0">
          <div className="h-1.5 bg-primary" />
          <div className="bg-linear-to-b from-accent/30 to-surface p-4 sm:p-5">
            <CatalogSearch
              action="/admin/doctors"
              query={query}
              placeholder="Search by name, profession, or department"
            />
          </div>
        </Card>

        {visible.length === 0 ? (
          <EmptyState
            className="mt-8"
            title={query ? "No doctors match this search" : "No doctors yet"}
            description={
              query
                ? "Try a different name, or clear the search."
                : "Add a doctor, then assign departments, services, and weekly hours."
            }
            action={
              query ? (
                <Link href="/admin/doctors" className={buttonClass({ variant: "secondary" })}>
                  Clear search
                </Link>
              ) : canManage ? (
                <Link href="/admin/doctors/new" className={buttonClass({ variant: "secondary" })}>
                  Add doctor
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            <p className="mt-8 mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <Stethoscope className="size-4 text-primary" aria-hidden />
              {countLabel}
            </p>
            <ul className={`grid gap-4 md:grid-cols-2 ${cardGridHoverClass}`}>
              {visible.map((doctor) => (
                <li key={doctor.id}>
                  <CatalogPreviewCard
                    title={doctor.full_name}
                    meta={`${doctor.profession}${doctor.specialization ? ` · ${doctor.specialization}` : ""}`}
                    description={
                      doctor.departments.length > 0
                        ? undefined
                        : "No department assigned"
                    }
                    chips={doctor.departments.map((department) => department.name)}
                    active={doctor.is_active}
                    editHref={`/admin/doctors/${doctor.id}`}
                    canEdit={canManage}
                    fields={[
                      { label: "Full name", value: doctor.full_name },
                      { label: "Profession", value: doctor.profession },
                      { label: "Specialization", value: doctor.specialization ?? "" },
                      {
                        label: "Departments",
                        value: doctor.departments.map((department) => department.name).join(", "),
                      },
                      {
                        label: "Consultation fee",
                        value:
                          doctor.consultation_fee !== null ? String(doctor.consultation_fee) : "",
                      },
                      { label: "Status", value: doctor.is_active ? "Active" : "Hidden" },
                    ]}
                    leading={
                      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent text-sm font-semibold tracking-wide text-primary ring-2 ring-white">
                        {doctor.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={doctor.photo_url}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          doctor.full_name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() ?? "")
                            .join("")
                        )}
                      </span>
                    }
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
