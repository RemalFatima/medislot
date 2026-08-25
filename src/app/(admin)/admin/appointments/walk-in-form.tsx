"use client";

import { useActionState } from "react";
import { Field, fieldClass, textareaClass } from "@/components/ui/field";
import { formatAppointmentTime } from "@/server/appointments/format";
import type { PublicSlot } from "@/server/appointments/slots";
import type { CatalogFormState } from "../form-utils";
import { createWalkInAction } from "./actions";

const initialState: CatalogFormState = {};

export function WalkInForm({
  doctorId,
  serviceId,
  timezone,
  slots,
}: {
  doctorId: string;
  serviceId: string;
  timezone: string;
  slots: PublicSlot[];
}) {
  const [state, formAction, pending] = useActionState(
    createWalkInAction,
    initialState,
  );

  if (slots.length === 0) {
    return (
      <p className="mt-6 text-sm text-zinc-600">
        No times available on this day. Try another date or doctor.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex max-w-xl flex-col gap-4">
      <input type="hidden" name="doctor_id" value={doctorId} />
      <input type="hidden" name="service_id" value={serviceId} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-800">
          Time ({timezone})
        </legend>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <label
              key={slot.startAt}
              className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-900 has-[:checked]:text-white"
            >
              <input
                type="radio"
                name="start_at"
                value={slot.startAt}
                required
                className="sr-only"
              />
              {formatAppointmentTime(slot.startAt, timezone)}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Patient name">
        <input
          name="patient_name"
          required
          minLength={2}
          className={fieldClass}
        />
      </Field>
      <Field label="Phone">
        <input
          name="patient_phone"
          required
          minLength={7}
          className={fieldClass}
        />
      </Field>
      <Field label="Email (optional)">
        <input type="email" name="patient_email" className={fieldClass} />
      </Field>
      <Field label="Notes (optional)">
        <textarea name="notes" rows={3} className={textareaClass} />
      </Field>

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create walk-in"}
      </button>
    </form>
  );
}
