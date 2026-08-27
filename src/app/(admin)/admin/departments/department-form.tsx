"use client";

import { useActionState } from "react";
import type { Department } from "@/server/catalog/departments";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { checkboxClass, Field, fieldClass, textareaClass } from "@/components/ui/field";
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
      <Field label="Description" hint="Shown on the public departments page.">
        <textarea
          name="description"
          rows={4}
          defaultValue={department?.description ?? ""}
          disabled={readOnly}
          className={textareaClass}
        />
      </Field>
      <Field label="Display order" hint="Lower numbers appear first.">
        <input
          type="number"
          name="sort_order"
          min={0}
          defaultValue={department?.sort_order ?? 0}
          disabled={readOnly}
          className={fieldClass}
        />
      </Field>
      <label className="flex items-start gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={department?.is_active ?? true}
          disabled={readOnly}
          className={`mt-0.5 ${checkboxClass}`}
        />
        <span>
          Active
          <span className="mt-0.5 block text-xs text-muted">
            Hidden departments are not shown on the public site.
          </span>
        </span>
      </label>
      <FormError message={state.error} />
      {readOnly ? (
        <p className="text-sm text-muted">Only owners and admins can edit departments.</p>
      ) : (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : department ? "Save department" : "Create department"}
        </Button>
      )}
    </form>
  );
}
