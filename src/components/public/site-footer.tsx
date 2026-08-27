import Link from "next/link";
import type { PublicOrganization } from "@/server/tenant/getPublicOrganization";
import { Container } from "@/components/ui/container";

export function SiteFooter({
  organization,
}: {
  organization: PublicOrganization | null;
}) {
  const name = organization?.name ?? "MediSlot";
  const contact = [
    organization?.phone,
    organization?.email,
    organization?.city,
  ].filter(Boolean);

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          {organization?.branding.tagline ? (
            <p className="mt-2 max-w-xs text-sm text-muted">
              {organization.branding.tagline}
            </p>
          ) : (
            <p className="mt-2 max-w-xs text-sm text-muted">
              Find a doctor and book an appointment online.
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Visit
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/departments" className="text-foreground hover:text-primary">
                Departments
              </Link>
            </li>
            <li>
              <Link href="/doctors" className="text-foreground hover:text-primary">
                Doctors
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-foreground hover:text-primary">
                Staff sign in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Contact
          </p>
          {contact.length > 0 || organization?.address ? (
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {organization?.phone ? <li>{organization.phone}</li> : null}
              {organization?.email ? <li>{organization.email}</li> : null}
              {organization?.address ? <li>{organization.address}</li> : null}
              {organization?.city ? <li>{organization.city}</li> : null}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Contact details will appear here when the clinic adds them.
            </p>
          )}
        </div>
      </Container>
    </footer>
  );
}
