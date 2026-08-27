import Link from "next/link";
import { CatalogSearch } from "@/components/admin/catalog-search";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listServices } from "@/server/catalog/services";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const query = (await searchParams).q?.trim() || undefined;
  const services = await listServices();
  const visible = query
    ? services.filter((service) =>
        `${service.name} ${service.description ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : services;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Services"
        description="Visit types staff and patients book against. Duration drives available slots."
        actions={
          canManage ? (
            <Link href="/admin/services/new" className={buttonClass()}>
              Add service
            </Link>
          ) : null
        }
      />

      <Card className="p-4 sm:p-5">
        <CatalogSearch
          action="/admin/services"
          query={query}
          placeholder="Search services"
        />
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title={query ? "No services match this search" : "No services yet"}
          description={
            query
              ? "Try a different name, or clear the search."
              : "Add a service, then assign it to doctors who offer it."
          }
          action={
            query ? (
              <Link href="/admin/services" className={buttonClass({ variant: "secondary" })}>
                Clear search
              </Link>
            ) : canManage ? (
              <Link href="/admin/services/new" className={buttonClass({ variant: "secondary" })}>
                Add service
              </Link>
            ) : null
          }
        />
      ) : (
        <>
          <ul className="mt-6 grid gap-3 lg:hidden">
            {visible.map((service) => (
              <li key={service.id}>
                <Link href={`/admin/services/${service.id}`}>
                  <Card className="p-4 transition-colors hover:border-primary/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <p className="mt-1 text-sm text-muted">
                          {service.duration_minutes} min
                          {service.price !== null ? ` · ${service.price}` : ""}
                        </p>
                      </div>
                      <VisibilityBadge active={service.is_active} />
                    </div>
                    {service.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {service.description}
                      </p>
                    ) : null}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-176 border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="py-3 pr-4 font-medium">Service</th>
                  <th className="py-3 pr-4 font-medium">Duration</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((service) => (
                  <tr key={service.id} className="border-b border-border">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {service.name}
                      </Link>
                      {service.description ? (
                        <p className="mt-0.5 line-clamp-1 text-muted">{service.description}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-foreground">{service.duration_minutes} min</td>
                    <td className="py-3 pr-4 text-foreground">
                      {service.price !== null ? service.price : "—"}
                    </td>
                    <td className="py-3">
                      <VisibilityBadge active={service.is_active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
