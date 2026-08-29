import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { CatalogPreviewCard } from "@/components/admin/catalog-preview";
import { CatalogSearch } from "@/components/admin/catalog-search";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listServices } from "@/server/catalog/services";
import { buttonClass } from "@/components/ui/button";
import { Card, cardGridHoverClass } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

function serviceFields(service: {
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
}) {
  return [
    { label: "Name", value: service.name },
    { label: "Description", value: service.description ?? "" },
    { label: "Duration", value: `${service.duration_minutes} min` },
    { label: "Price", value: service.price !== null ? String(service.price) : "" },
    { label: "Status", value: service.is_active ? "Active" : "Hidden" },
  ];
}

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
  const countLabel = visible.length === 1 ? "1 service" : `${visible.length} services`;

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Catalog"
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

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden p-0">
          <div className="h-1.5 bg-primary" />
          <div className="bg-linear-to-b from-accent/30 to-surface p-4 sm:p-5">
            <CatalogSearch
              action="/admin/services"
              query={query}
              placeholder="Search services"
            />
          </div>
        </Card>

        {visible.length === 0 ? (
          <EmptyState
            className="mt-8"
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
            <p className="mt-8 mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <ClipboardList className="size-4 text-primary" aria-hidden />
              {countLabel}
            </p>
            <ul className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${cardGridHoverClass}`}>
              {visible.map((service) => (
                <li key={service.id}>
                  <CatalogPreviewCard
                    title={service.name}
                    description={service.description}
                    meta={`${service.duration_minutes} min${service.price !== null ? ` · ${service.price}` : ""}`}
                    active={service.is_active}
                    editHref={`/admin/services/${service.id}`}
                    canEdit={canManage}
                    fields={serviceFields(service)}
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
