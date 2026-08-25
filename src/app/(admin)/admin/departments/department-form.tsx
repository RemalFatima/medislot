"use client";

import { useActionState } from "react";
import type { Department } from "@/server/catalog/departments";
import { Field, fieldClass, textareaClass } from "@/components/ui/field";
import type { CatalogFormState } from "../form-utils";
import {
  createDepartmentAction,
  updateDepartmentAction,
} from "./actions";

const initialState: CatalogFormState = {};

export function DepartmentForm({
  department,
  readOnly,
}: {
  department?: Department;
  readOnly: boolean;
}) {
  const action = department ? updateDepartmentAction : createDepartmentAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {department ? <input type="hidden" name="id" value={department.id} /> : null}
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={department?.name}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={department?.description ?? ""}
          disabled={readOnly}
          className={textareaClass}
        />
      </Field>
      <Field label="Display order">
        <input
          type="number"
          name="sort_order"
          min={0}
          defaultValue={department?.sort_order ?? 0}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={department?.is_active ?? true}
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
          {pending ? "Saving…" : department ? "Save department" : "Create department"}
        </button>
      )}
    </form>
  );
}
