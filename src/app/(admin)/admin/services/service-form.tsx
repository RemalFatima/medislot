"use client";

import { useActionState } from "react";
import type { Service } from "@/server/catalog/services";
import { Field, fieldClass, textareaClass } from "@/components/ui/field";
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
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
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
      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={service?.description ?? ""}
          disabled={readOnly}
          className={textareaClass}
        />
      </Field>
      <Field label="Duration (minutes)">
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
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={service?.is_active ?? true}
          disabled={readOnly}
        />
        Active
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
          {pending ? "Saving…" : service ? "Save service" : "Create service"}
        </button>
      )}
    </form>
  );
}
