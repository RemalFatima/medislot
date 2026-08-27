import Link from "next/link";
import type { PublicOrganization } from "@/server/tenant/getPublicOrganization";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { APP_NAME } from "@/lib/brand";

export function SiteFooter({
  organization,
}: {
  organization: PublicOrganization | null;
}) {
  const contact = [
    organization?.phone,
    organization?.email,
    organization?.city,
  ].filter(Boolean);

  return (
    <footer className="mt-auto bg-primary-hover text-primary-foreground">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm font-semibold tracking-wide">{APP_NAME}</p>
          {organization?.branding.tagline ? (
            <p className="mt-2 max-w-xs text-sm text-white/80">
              {organization.branding.tagline}
            </p>
          ) : (
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Find a doctor and book an appointment online.
            </p>
          )}
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Visit
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/departments" className="text-white/80 hover:text-white">
                Departments
              </Link>
            </li>
            <li>
              <Link href="/doctors" className="text-white/80 hover:text-white">
                Doctors
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-white/80 hover:text-white">
                Staff sign in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Contact
          </h2>
          {contact.length > 0 || organization?.address ? (
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              {organization?.phone ? (
                <li>
                  <a
                    href={`tel:${organization.phone.replace(/\s+/g, "")}`}
                    className="hover:text-white"
                  >
                    {organization.phone}
                  </a>
                </li>
              ) : null}
              {organization?.email ? (
                <li>
                  <a href={`mailto:${organization.email}`} className="hover:text-white">
                    {organization.email}
                  </a>
                </li>
              ) : null}
              {organization?.address ? <li>{organization.address}</li> : null}
              {organization?.city ? <li>{organization.city}</li> : null}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/80">
              Contact details will appear here when the clinic adds them.
            </p>
          )}
        </div>
      </Container>
      <div className="border-t border-white/15">
        <Container className="flex justify-end py-4">
          <Link
            href="/doctors"
            className={buttonClass({ variant: "inverse", size: "sm" })}
          >
            Book an appointment
          </Link>
        </Container>
      </div>
    </footer>
  );
}
