"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { EXCEPTION_TYPES } from "@/server/scheduling/constants";
import type { CatalogFormState } from "../form-utils";
import { createExceptionAction } from "../scheduling-actions";

const initialState: CatalogFormState = {};

const TYPE_HINTS: Record<string, string> = {
  holiday: "A full-day clinic or doctor closure. Leave times empty unless only part of the day is closed.",
  leave: "Doctor is away. Usually clinic-wide is not used for leave.",
  special_hours: "Different working hours on this date. Start and end times are required.",
  unavailable: "Blocked time that should not be bookable. Leave times empty for the whole day.",
};

export function ExceptionForm({ doctors }: { doctors: DoctorListItem[] }) {
  const [state, formAction, pending] = useActionState(
    createExceptionAction,
    initialState,
  );
  const [type, setType] = useState("holiday");

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Applies to" hint="Clinic-wide affects every doctor.">
        <select name="doctor_id" defaultValue="" className={fieldClass}>
          <option value="">Entire clinic</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name} only
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" name="date" required className={fieldClass} />
      </Field>
      <Field label="Type">
        <select
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className={fieldClass}
        >
          {EXCEPTION_TYPES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reason (optional)">
        <input name="reason" className={fieldClass} />
      </Field>
      <Field
        label="Start time (optional)"
        hint={type === "special_hours" ? "Required for special hours." : undefined}
      >
        <input type="time" name="start_time" className={fieldClass} />
      </Field>
      <Field
        label="End time (optional)"
        hint={type === "special_hours" ? "Required for special hours." : undefined}
      >
        <input type="time" name="end_time" className={fieldClass} />
      </Field>
      <p className="text-sm text-muted sm:col-span-2">{TYPE_HINTS[type]}</p>
      <div className="sm:col-span-2">
        <FormError message={state.error} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add date"}
        </Button>
      </div>
    </form>
  );
}
