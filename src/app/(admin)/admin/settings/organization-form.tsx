"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FormError } from "@/components/admin/form-error";
import { VisibilityBadge } from "@/components/admin/visibility-badge";
import { Button, buttonClass } from "@/components/ui/button";
import { checkboxClass, Field, fieldClass, textareaClass, ValidatedForm } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { OrganizationSettings } from "@/server/settings/organization";
import type { CatalogFormState } from "../form-utils";
import { updateOrganizationSettingsAction } from "./actions";

const initialState: CatalogFormState = {};

const LOCALES = [
  { value: "en", label: "English" },
  { value: "en-GB", label: "English (UK)" },
  { value: "en-US", label: "English (US)" },
  { value: "ur", label: "Urdu" },
  { value: "ur-PK", label: "Urdu (Pakistan)" },
];

const TYPES = [
  { value: "clinic", label: "Clinic" },
  { value: "hospital", label: "Hospital" },
] as const;

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
      <div className="h-1.5 bg-primary" />
      <div className="bg-linear-to-b from-accent/40 to-surface p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
        <div className="mt-4 flex flex-col gap-4">{children}</div>
      </div>
    </section>
  );
}

export function OrganizationSettingsForm({
  organization,
  timezones,
  readOnly,
}: {
  organization: OrganizationSettings;
  timezones: string[];
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrganizationSettingsAction,
    initialState,
  );
  const [name, setName] = useState(organization.name);
  const [tagline, setTagline] = useState(organization.branding.tagline ?? "");
  const [description, setDescription] = useState(
    organization.branding.description ?? "",
  );
  const [logoUrl, setLogoUrl] = useState(organization.logo_url ?? "");
  const [isActive, setIsActive] = useState(organization.is_active);
  const [orgType, setOrgType] = useState(organization.type);
  const [phone, setPhone] = useState(organization.phone ?? "");
  const [email, setEmail] = useState(organization.email ?? "");
  const [city, setCity] = useState(organization.city ?? "");
  const [address, setAddress] = useState(organization.address ?? "");
  const [timezone, setTimezone] = useState(organization.timezone);
  const [zoneQuery, setZoneQuery] = useState("");

  const locales = useMemo(() => {
    if (LOCALES.some((item) => item.value === organization.locale)) {
      return LOCALES;
    }
    return [{ value: organization.locale, label: organization.locale }, ...LOCALES];
  }, [organization.locale]);

  const visibleZones = useMemo(() => {
    const query = zoneQuery.trim().toLowerCase();
    const matches = query
      ? timezones.filter((zone) => zone.toLowerCase().replace(/_/g, " ").includes(query))
      : timezones;
    if (matches.includes(timezone)) {
      return matches;
    }
    return [timezone, ...matches];
  }, [timezones, zoneQuery, timezone]);

  return (
    <ValidatedForm action={formAction} className="flex flex-col gap-6">
      {readOnly ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Only owners and admins can change clinic settings.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex flex-col gap-6">
          <SettingsSection
            title="Clinic information"
            description={`Public name and clinic type. The site slug stays ${organization.slug}.`}
          >
            <Field label="Clinic name">
              <input
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={readOnly}
                className={fieldClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-foreground">Type</legend>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((entry) => {
                    const selected = orgType === entry.value;
                    return (
                      <label
                        key={entry.value}
                        className={cn(
                          "cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm transition-colors",
                          selected
                            ? "border-primary/40 bg-accent font-medium text-foreground"
                            : "border-border bg-surface text-foreground hover:border-primary/20",
                          readOnly && "cursor-not-allowed opacity-60",
                        )}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={entry.value}
                          checked={selected}
                          onChange={() => setOrgType(entry.value)}
                          disabled={readOnly}
                          className="sr-only"
                          required
                        />
                        {entry.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <Field label="Locale" hint="Used as the public site language.">
                <select
                  name="locale"
                  required
                  defaultValue={organization.locale}
                  disabled={readOnly}
                  className={fieldClass}
                >
                  {locales.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Branding"
            description="Shown on the public website header, homepage, and browser tab."
          >
            <Field label="Tagline">
              <input
                name="tagline"
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                disabled={readOnly}
                className={fieldClass}
                placeholder="Care close to home"
              />
            </Field>
            <Field label="Public description">
              <textarea
                name="description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={readOnly}
                className={textareaClass}
              />
            </Field>
            <Field label="Logo URL" hint="Paste an image URL. A preview appears on the right.">
              <input
                name="logo_url"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                disabled={readOnly}
                className={fieldClass}
              />
            </Field>
          </SettingsSection>

          <SettingsSection
            title="Contact information"
            description="Shown in the public footer when provided."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input
                  name="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={readOnly}
                  className={fieldClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={readOnly}
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="City">
              <input
                name="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                disabled={readOnly}
                className={fieldClass}
              />
            </Field>
            <Field label="Address">
              <textarea
                name="address"
                rows={3}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={readOnly}
                className={textareaClass}
              />
            </Field>
          </SettingsSection>

          <SettingsSection
            title="Timezone"
            description="Weekly hours and available slots use this timezone. Changing it does not rewrite existing appointments."
          >
            <Field label="Search timezones">
              <input
                type="search"
                value={zoneQuery}
                onChange={(event) => setZoneQuery(event.target.value)}
                disabled={readOnly}
                className={fieldClass}
                placeholder="Karachi, London, UTC…"
                autoComplete="off"
              />
            </Field>
            <Field label="Clinic timezone">
              <select
                name="timezone"
                required
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                disabled={readOnly}
                className={fieldClass}
              >
                {visibleZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
          </SettingsSection>

          <SettingsSection
            title="Public visibility"
            description="When off, the public site does not show this clinic."
          >
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                isActive
                  ? "border-primary/30 bg-accent"
                  : "border-border bg-surface",
                readOnly && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="checkbox"
                name="is_active"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={readOnly}
                className={`mt-0.5 ${checkboxClass}`}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                  Public site is visible
                  <VisibilityBadge active={isActive} />
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  Uncheck to hide the public booking website.
                </span>
              </span>
            </label>
          </SettingsSection>
        </div>

        <aside className="lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
            <div className="h-1.5 bg-primary" />
            <div className="bg-linear-to-b from-accent/50 to-surface p-5">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Public preview
              </p>
              <div className="mt-4 flex items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt=""
                    className="size-14 rounded-2xl object-cover ring-2 ring-white"
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-base font-semibold text-primary ring-2 ring-white">
                    {(name || "M").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {name || "Clinic name"}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-muted">
                    {orgType}
                    {city ? ` · ${city}` : ""}
                  </p>
                </div>
              </div>
              {tagline ? (
                <p className="mt-4 text-sm font-medium text-foreground">{tagline}</p>
              ) : (
                <p className="mt-4 text-sm text-muted">No tagline yet.</p>
              )}
              {description ? (
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted">
                  {description}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">No public description yet.</p>
              )}

              <ul className="mt-4 space-y-2 text-sm text-muted">
                {phone ? (
                  <li className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0 text-primary" aria-hidden />
                    {phone}
                  </li>
                ) : null}
                {email ? (
                  <li className="flex items-center gap-2">
                    <Mail className="size-3.5 shrink-0 text-primary" aria-hidden />
                    {email}
                  </li>
                ) : null}
                {address ? (
                  <li className="flex items-start gap-2">
                    <MapPin className="size-3.5 mt-0.5 shrink-0 text-primary" aria-hidden />
                    <span>{address}</span>
                  </li>
                ) : null}
                <li className="flex items-center gap-2">
                  <Globe className="size-3.5 shrink-0 text-primary" aria-hidden />
                  {timezone.replace(/_/g, " ")}
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="size-3.5 shrink-0 text-primary" aria-hidden />
                  {organization.slug}
                </li>
              </ul>

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4">
                <VisibilityBadge active={isActive} />
                {isActive ? (
                  <Link
                    href="/"
                    className={buttonClass({ variant: "secondary", size: "sm" })}
                  >
                    View public site
                  </Link>
                ) : (
                  <p className="text-xs text-muted">Hidden from patients</p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {readOnly ? null : (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FormError message={state.error} />
            <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:ms-auto">
              {pending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </div>
      )}
    </ValidatedForm>
  );
}
