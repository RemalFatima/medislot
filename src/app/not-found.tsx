import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";
import { buttonClass } from "@/components/ui/button";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicOrganization } from "@/server/tenant/getPublicOrganization";
import { APP_NAME } from "@/lib/brand";

export default async function NotFound() {
  const organization = await getPublicOrganization();

  return (
    <div className="flex min-h-full min-w-0 flex-1 flex-col">
      <SiteHeader name={APP_NAME} />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center"
      >
        <ErrorState
          title="Page not found"
          description="That page does not exist or is no longer available."
          action={
            <>
              <Link href="/" className={buttonClass({ className: "w-full sm:w-auto" })}>
                Back to home
              </Link>
              <Link
                href="/doctors"
                className={buttonClass({ variant: "secondary", className: "w-full sm:w-auto" })}
              >
                Browse doctors
              </Link>
            </>
          }
        />
      </main>
      <SiteFooter organization={organization} />
    </div>
  );
}
