import Link from "next/link";
import { CatalogSearch } from "@/components/admin/catalog-search";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listDoctors } from "@/server/catalog/doctors";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

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

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
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

      <Card className="p-4 sm:p-5">
        <CatalogSearch
          action="/admin/doctors"
          query={query}
          placeholder="Search by name, profession, or department"
        />
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
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
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {visible.map((doctor) => (
            <li key={doctor.id}>
              <Link href={`/admin/doctors/${doctor.id}`} className="block h-full">
                <Card className="flex h-full gap-4 p-4 transition-colors hover:border-primary/30">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent text-sm font-semibold text-primary">
                    {doctor.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={doctor.photo_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      doctor.full_name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">{doctor.full_name}</p>
                      <VisibilityBadge active={doctor.is_active} />
                    </div>
                    <p className="mt-0.5 text-sm text-muted">
                      {doctor.profession}
                      {doctor.specialization ? ` · ${doctor.specialization}` : ""}
                    </p>
                    {doctor.departments.length > 0 ? (
                      <p className="mt-1 truncate text-xs text-muted">
                        {doctor.departments.map((department) => department.name).join(", ")}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted">No department assigned</p>
                    )}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
