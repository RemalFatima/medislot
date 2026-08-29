"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, fieldClass, ValidatedForm } from "@/components/ui/field";
import { APPOINTMENT_STATUS_LABELS } from "@/server/appointments/labels";
import type { AppointmentStatus } from "@/types/database";

const STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export function AppointmentsFilters({
  date,
  doctorId,
  status,
  doctors,
}: {
  date: string;
  doctorId?: string;
  status?: AppointmentStatus;
  doctors: { id: string; full_name: string }[];
}) {
  const [pending, setPending] = useState(false);

  return (
    <ValidatedForm
      method="get"
      onSubmit={() => setPending(true)}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Field label="Date">
        <input type="date" name="date" required defaultValue={date} className={fieldClass} />
      </Field>
      <Field label="Doctor">
        <select name="doctor" defaultValue={doctorId ?? ""} className={fieldClass}>
          <option value="">All doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select name="status" defaultValue={status ?? ""} className={fieldClass}>
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {APPOINTMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full">
          {pending ? "Filtering…" : "Apply filters"}
        </Button>
      </div>
    </ValidatedForm>
  );
}
