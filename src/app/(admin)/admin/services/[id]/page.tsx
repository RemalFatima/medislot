import Link from "next/link";
import { notFound } from "next/navigation";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { getServiceById } from "@/server/catalog/services";
import { ServiceForm } from "../service-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm text-muted">
        <Link href="/admin/services" className="hover:text-foreground">
          Services
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-foreground">{service.name}</span>
      </p>
      <PageHeader
        title={service.name}
        description="Uncheck Active to stop this service being booked online. Catalog rows are not deleted."
        actions={<VisibilityBadge active={service.is_active} />}
      />
      <Card className="max-w-xl p-5 sm:p-6">
        <ServiceForm service={service} readOnly={!canManageCatalog(staff.role)} />
      </Card>
    </main>
  );
}
