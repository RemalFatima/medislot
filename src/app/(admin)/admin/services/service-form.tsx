"use client";

import { useActionState } from "react";
import type { Service } from "@/server/catalog/services";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { checkboxClass, Field, fieldClass, textareaClass, ValidatedForm } from "@/components/ui/field";
import type { CatalogFormState } from "../form-utils";
import { createServiceAction, updateServiceAction } from "./actions";

const initialState: CatalogFormState = {};

export function ServiceForm({
  service,
  readOnly,
}: {
  service?: Service;
  readOnly: boolean;
}) {
  const action = service ? updateServiceAction : createServiceAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <ValidatedForm action={formAction} className="flex flex-col gap-5">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={service?.name}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <Field label="Description" hint="Optional note for clinic staff.">
        <textarea
          name="description"
          rows={4}
          defaultValue={service?.description ?? ""}
          disabled={readOnly}
          className={textareaClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Duration (minutes)" hint="Used to calculate available slots.">
          <input
            type="number"
            name="duration_minutes"
            min={1}
            required
            defaultValue={service?.duration_minutes ?? 15}
            disabled={readOnly}
            className={fieldClass}
          />
        </Field>
        <Field label="Price (optional)">
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={service?.price ?? ""}
            disabled={readOnly}
            className={fieldClass}
          />
        </Field>
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-border bg-surface px-3 py-3 text-sm text-foreground">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={service?.is_active ?? true}
          disabled={readOnly}
          className={`mt-0.5 ${checkboxClass}`}
        />
        <span>
          Bookable online
          <span className="mt-0.5 block text-xs text-muted">
            Hidden services cannot be booked on the public site.
          </span>
        </span>
      </label>
      <FormError message={state.error} />
      {readOnly ? (
        <p className="text-sm text-muted">Only owners and admins can edit services.</p>
      ) : (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending
            ? service
              ? "Updating…"
              : "Creating…"
            : service
              ? "Update service"
              : "Create service"}
        </Button>
      )}
    </ValidatedForm>
  );
}
