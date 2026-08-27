import type { ReactNode } from "react";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicOrganization } from "@/server/tenant/getPublicOrganization";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const organization = await getPublicOrganization();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader
        name={organization?.name ?? "MediSlot"}
        logoUrl={organization?.logo_url ?? null}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter organization={organization} />
    </div>
  );
}
