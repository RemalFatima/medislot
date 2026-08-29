"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, fieldClass, ValidatedForm } from "@/components/ui/field";

export function WalkInFilters({
  doctors,
  services,
  selectedDoctorId,
  selectedServiceId,
  today,
  maxDate,
  date,
}: {
  doctors: { id: string; full_name: string }[];
  services: { id: string; name: string; duration_minutes: number }[];
  selectedDoctorId: string;
  selectedServiceId: string;
  today: string;
  maxDate: string;
  date: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <ValidatedForm
      method="get"
      onSubmit={() => setPending(true)}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Field label="Doctor">
        <select name="doctor" required defaultValue={selectedDoctorId} className={fieldClass}>
          {doctors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.full_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Service">
        <select name="service" required defaultValue={selectedServiceId} className={fieldClass}>
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
        <Button type="submit" variant="secondary" disabled={pending} className="w-full">
          <CalendarClock className="size-4" aria-hidden />
          {pending ? "Loading times…" : "Show times"}
        </Button>
      </div>
    </ValidatedForm>
  );
}
