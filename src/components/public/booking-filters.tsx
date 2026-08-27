"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, fieldClass, ValidatedForm } from "@/components/ui/field";

type ServiceOption = {
  id: string;
  name: string;
  duration_minutes: number;
};

export function BookingFilters({
  action,
  services,
  selectedServiceId,
  today,
  maxDate,
  date,
}: {
  action: string;
  services: ServiceOption[];
  selectedServiceId: string;
  today: string;
  maxDate: string;
  date: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <ValidatedForm
      action={action}
      method="get"
      onSubmit={() => setPending(true)}
      className="grid gap-3 rounded-xl border border-border bg-accent/40 p-3 sm:grid-cols-[1fr_1fr_auto] sm:p-4"
    >
      <Field label="Service">
        <select
          name="service"
          required
          defaultValue={selectedServiceId}
          className={fieldClass}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration_minutes} min)
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input
          type="date"
          name="date"
          required
          min={today}
          max={maxDate}
          defaultValue={date}
          className={fieldClass}
        />
      </Field>
      <div className="flex items-end">
        <Button
          type="submit"
          variant="secondary"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending ? "Loading times…" : "Show times"}
        </Button>
      </div>
    </ValidatedForm>
  );
}
