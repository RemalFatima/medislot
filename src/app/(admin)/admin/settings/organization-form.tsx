"use client";

import { useActionState } from "react";
import { Field, fieldClass, textareaClass } from "@/components/ui/field";
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

  return (
    <form action={formAction} className="mt-6 flex max-w-2xl flex-col gap-4">
      <Field label="Clinic name">
        <input
          name="name"
          required
          defaultValue={organization.name}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <select
            name="type"
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
      <Field label="Timezone">
        <select
          name="timezone"
          defaultValue={organization.timezone}
          disabled={readOnly}
          className={fieldClass}
        >
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </Field>
      <p className="text-xs text-zinc-500">
        Weekly hours and slots are interpreted in this timezone. Changing it
        does not rewrite existing appointments.
      </p>
      <Field label="Tagline">
        <input
          name="tagline"
          defaultValue={organization.branding.tagline ?? ""}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <Field label="Public description">
        <textarea
          name="description"
          rows={4}
          defaultValue={organization.branding.description ?? ""}
          disabled={readOnly}
          className={textareaClass}
        />
      </Field>
      <Field label="Logo URL">
        <input
          name="logo_url"
          defaultValue={organization.logo_url ?? ""}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
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
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={organization.is_active}
          disabled={readOnly}
        />
        Active (visible on the public site)
      </label>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {readOnly ? null : (
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
      )}
    </form>
  );
}
