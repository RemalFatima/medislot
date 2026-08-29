import Link from "next/link";
import { CatalogFormCard, CatalogPageHero } from "@/components/admin/catalog-page-hero";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { ServiceForm } from "../service-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);

  return (
    <main className="flex-1">
      <CatalogPageHero
        eyebrow="Catalog"
        title="New service"
        description="Duration is used when calculating available appointment times."
        breadcrumb={
          <Breadcrumb
            items={[
              { href: "/admin/services", label: "Services" },
              { label: "New" },
            ]}
          />
        }
      />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {canManage ? (
          <CatalogFormCard kicker="Service details">
            <ServiceForm readOnly={false} />
          </CatalogFormCard>
        ) : (
          <EmptyState
            title="You cannot add services"
            description="Only owners and admins can change the catalog."
            action={
              <Link href="/admin/services" className={buttonClass({ variant: "secondary" })}>
                Back to services
              </Link>
            }
          />
        )}
      </div>
    </main>
  );
}
