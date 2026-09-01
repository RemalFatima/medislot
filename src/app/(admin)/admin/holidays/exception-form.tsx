"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Field, fieldClass, ValidatedForm } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { DoctorListItem } from "@/server/catalog/doctors";
import { EXCEPTION_TYPES } from "@/server/scheduling/constants";
import type { CatalogFormState } from "../form-utils";
import { createExceptionAction } from "../scheduling-actions";

const initialState: CatalogFormState = {};

const TYPE_HINTS: Record<string, string> = {
  holiday:
    "A full-day clinic or doctor closure. Leave times empty unless only part of the day is closed.",
  leave: "Doctor is away. Choose a doctor rather than the entire clinic.",
  special_hours:
    "Different working hours on this date. Start and end times are required.",
  unavailable:
    "Blocked time that should not be bookable. Leave times empty for the whole day.",
};

export function ExceptionForm({ doctors }: { doctors: DoctorListItem[] }) {
  const [state, formAction, pending] = useActionState(
    createExceptionAction,
    initialState,
  );
  const [type, setType] = useState("holiday");
  const needsTimes = type === "special_hours";

  return (
    <ValidatedForm action={formAction} className="grid gap-4 sm:grid-cols-2">
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

      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-sm font-medium text-foreground">Type</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {EXCEPTION_TYPES.map((entry) => {
            const selected = type === entry.value;
            return (
              <label
                key={entry.value}
                className={cn(
                  "cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  selected
                    ? "border-primary/40 bg-accent font-medium text-foreground"
                    : "border-border bg-surface text-foreground hover:border-primary/20",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={entry.value}
                  checked={selected}
                  onChange={() => setType(entry.value)}
                  className="sr-only"
                  required
                />
                {entry.label}
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">{TYPE_HINTS[type]}</p>
      </fieldset>

      <div className="sm:col-span-2">
        <Field label="Reason (optional)">
          <input name="reason" className={fieldClass} placeholder="Eid holiday, conference…" />
        </Field>
      </div>

      <Field
        label={needsTimes ? "Start time" : "Start time (optional)"}
        hint={needsTimes ? "Required for special hours." : undefined}
        required={needsTimes}
      >
        <input
          type="time"
          name="start_time"
          required={needsTimes}
          className={fieldClass}
        />
      </Field>
      <Field
        label={needsTimes ? "End time" : "End time (optional)"}
        hint={needsTimes ? "Required for special hours." : undefined}
        required={needsTimes}
      >
        <input
          type="time"
          name="end_time"
          required={needsTimes}
          className={fieldClass}
        />
      </Field>

      <div className="sm:col-span-2">
        <FormError message={state.error} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Add date"}
        </Button>
      </div>
    </ValidatedForm>
  );
}
