"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { checkboxClass, Field, fieldClass, textareaClass, ValidatedForm } from "@/components/ui/field";
import type { OrganizationSettings } from "@/server/settings/organization";
import type { CatalogFormState } from "../form-utils";
import { updateOrganizationSettingsAction } from "./actions";

const initialState: CatalogFormState = {};

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

  return (
    <ValidatedForm action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Clinic information</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Public name and clinic type. The site slug stays {organization.slug}.
            </p>
            <div className="flex flex-col gap-4">
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
                <Field label="Type">
                  <select
                    name="type"
                    required
                    defaultValue={organization.type}
                    disabled={readOnly}
                    className={fieldClass}
                  >
                    <option value="clinic">Clinic</option>
                    <option value="hospital">Hospital</option>
                  </select>
                </Field>
                <Field label="Locale">
                  <input
                    name="locale"
                    required
                    defaultValue={organization.locale}
                    disabled={readOnly}
                    className={fieldClass}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Branding</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Shown on the public website header, homepage, and browser tab.
            </p>
            <div className="flex flex-col gap-4">
              <Field label="Tagline">
                <input
                  name="tagline"
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  disabled={readOnly}
                  className={fieldClass}
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
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Contact information</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Shown in the public footer when provided.
            </p>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone">
                  <input
                    name="phone"
                    defaultValue={organization.phone ?? ""}
                    disabled={readOnly}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    defaultValue={organization.email ?? ""}
                    disabled={readOnly}
                    className={fieldClass}
                  />
                </Field>
              </div>
              <Field label="City">
                <input
                  name="city"
                  defaultValue={organization.city ?? ""}
                  disabled={readOnly}
                  className={fieldClass}
                />
              </Field>
              <Field label="Address">
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={organization.address ?? ""}
                  disabled={readOnly}
                  className={textareaClass}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Timezone</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Weekly hours and available slots use this timezone. Changing it does
              not rewrite existing appointments.
            </p>
            <Field label="Clinic timezone">
              <select
                name="timezone"
                required
                defaultValue={organization.timezone}
                disabled={readOnly}
                className={fieldClass}
              >
                {timezones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Public visibility</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              When off, the public site does not show this clinic.
            </p>
            <label className="flex items-start gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                name="is_active"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={readOnly}
                className={`mt-0.5 ${checkboxClass}`}
              />
              <span>
                Public site is visible
                <span className="mt-0.5 block text-xs text-muted">
                  Uncheck to hide the public booking website.
                </span>
              </span>
            </label>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Public preview
            </p>
            <div className="mt-4 flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt=""
                  className="size-12 rounded-lg object-cover"
                />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-primary">
                  {(name || "M").slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {name || "Clinic name"}
                </p>
                <p className="text-xs text-muted">
                  {isActive ? "Visible on the public site" : "Hidden from the public site"}
                </p>
              </div>
            </div>
            {tagline ? (
              <p className="mt-4 text-sm font-medium text-foreground">{tagline}</p>
            ) : (
              <p className="mt-4 text-sm text-muted">No tagline yet.</p>
            )}
            {description ? (
              <p className="mt-2 line-clamp-4 text-sm text-muted">{description}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">No public description yet.</p>
            )}
          </Card>
        </aside>
      </div>

      <FormError message={state.error} />
      {readOnly ? (
        <p className="text-sm text-muted">Only owners and admins can change clinic settings.</p>
      ) : (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Save settings"}
        </Button>
      )}
    </ValidatedForm>
  );
}
