import type { ReactNode } from "react";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { APP_NAME } from "@/lib/brand";
import { getPublicOrganization } from "@/server/tenant/getPublicOrganization";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const organization = await getPublicOrganization();

  return (
    <div className="flex min-h-full min-w-0 flex-1 flex-col">
      <SiteHeader name={APP_NAME} />
      <div id="main-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
      <SiteFooter organization={organization} />
    </div>
  );
}
