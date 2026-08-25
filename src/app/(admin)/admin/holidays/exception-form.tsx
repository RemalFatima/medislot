"use client";

import { useActionState } from "react";
import { Field, fieldClass } from "@/components/ui/field";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { EXCEPTION_TYPES } from "@/server/scheduling/constants";
import type { CatalogFormState } from "../form-utils";
import { createExceptionAction } from "../scheduling-actions";

const initialState: CatalogFormState = {};

export function ExceptionForm({ doctors }: { doctors: DoctorListItem[] }) {
  const [state, formAction, pending] = useActionState(
    createExceptionAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-6 grid max-w-3xl gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2"
    >
      <Field label="Applies to">
        <select name="doctor_id" defaultValue="" className={fieldClass}>
          <option value="">Clinic-wide</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" name="date" required className={fieldClass} />
      </Field>
      <Field label="Type">
        <select name="type" defaultValue="holiday" className={fieldClass}>
          {EXCEPTION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reason (optional)">
        <input name="reason" className={fieldClass} />
      </Field>
      <Field label="Start (optional)">
        <input type="time" name="start_time" className={fieldClass} />
      </Field>
      <Field label="End (optional)">
        <input type="time" name="end_time" className={fieldClass} />
      </Field>
      <p className="text-xs text-zinc-500 sm:col-span-2">
        Special hours require start and end times. Other types can leave times
        empty for a full-day close.
      </p>
      {state.error ? (
        <p className="text-sm text-red-700 sm:col-span-2" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add exception"}
        </button>
      </div>
    </form>
  );
}
