"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, fieldClass, textareaClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
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
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  if (slots.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        title="No times available on this day"
        description="Try another date, doctor, or service."
      />
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-8 border-t border-border pt-8">
      <input type="hidden" name="doctor_id" value={doctorId} />
      <input type="hidden" name="service_id" value={serviceId} />

      <fieldset>
        <legend className="text-base font-semibold text-foreground">Choose a time</legend>
        <p className="mt-1 mb-3 text-sm text-muted">
          Available times in {timezone.replace(/_/g, " ")}.
          {selectedStart
            ? ` Selected ${formatAppointmentTime(selectedStart, timezone)}.`
            : " Select one slot to continue."}
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {slots.map((slot) => {
            const selected = selectedStart === slot.startAt;
            return (
              <label
                key={slot.startAt}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-accent",
                  "has-focus-visible:ring-2 has-focus-visible:ring-(--ring)",
                )}
              >
                <input
                  type="radio"
                  name="start_at"
                  value={slot.startAt}
                  required
                  className="sr-only"
                  onChange={() => setSelectedStart(slot.startAt)}
                />
                {formatAppointmentTime(slot.startAt, timezone)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex max-w-xl flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Patient details</h2>
          <p className="mt-1 text-sm text-muted">
            Same booking lock as online appointments. Confirmed instantly.
          </p>
        </div>
        <Field label="Patient name">
          <input name="patient_name" required minLength={2} className={fieldClass} />
        </Field>
        <Field label="Phone">
          <input
            name="patient_phone"
            required
            minLength={7}
            inputMode="tel"
            className={fieldClass}
          />
        </Field>
        <Field label="Email (optional)">
          <input type="email" name="patient_email" className={fieldClass} />
        </Field>
        <Field label="Notes (optional)">
          <textarea name="notes" rows={3} className={textareaClass} />
        </Field>
      </div>

      {state.error ? (
        <p
          className="rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Create walk-in"}
      </Button>
    </form>
  );
}
