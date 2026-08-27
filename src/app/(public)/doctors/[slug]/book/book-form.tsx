"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, fieldClass } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { PublicSlot } from "@/server/appointments/slots";
import { bookAppointmentAction, type BookFormState } from "./actions";

const initialState: BookFormState = {};

function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function BookForm({
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
    bookAppointmentAction,
    initialState,
  );
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  if (slots.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        title="No times available on this day"
        description="Try another date, or a different service if this visit type needs a longer slot."
      />
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-8 border-t border-border pt-8">
      <input type="hidden" name="doctor_id" value={doctorId} />
      <input type="hidden" name="service_id" value={serviceId} />

      <fieldset>
        <legend className="text-base font-semibold text-foreground">
          Choose a time
        </legend>
        <p className="mt-1 mb-3 text-sm text-muted">
          Available times in {timezone.replace(/_/g, " ")}.
          {selectedStart
            ? ` Selected ${formatTime(selectedStart, timezone)}.`
            : " Select one slot to continue."}
        </p>
        <div className="grid grid-cols-2 gap-2 min-[380px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
          {slots.map((slot) => {
            const label = formatTime(slot.startAt, timezone);
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
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Your details</h2>
          <p className="mt-1 text-sm text-muted">
            Guest booking — name and phone are required. No account needed.
          </p>
        </div>
        <Field label="Full name">
          <input
            name="patient_name"
            required
            minLength={2}
            autoComplete="name"
            className={fieldClass}
          />
        </Field>
        <Field label="Phone">
          <input
            name="patient_phone"
            required
            minLength={7}
            autoComplete="tel"
            inputMode="tel"
            className={fieldClass}
          />
        </Field>
        <Field
          label="Email (optional)"
          hint="Used only for this appointment if provided."
        >
          <input
            type="email"
            name="patient_email"
            autoComplete="email"
            className={fieldClass}
          />
        </Field>
      </div>

      <FormError message={state.error} />

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Booking…" : "Confirm appointment"}
      </Button>
    </form>
  );
}
