"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
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
    <form
      method="get"
      onSubmit={() => setPending(true)}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="min-w-0">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Date</span>
        <input type="date" name="date" defaultValue={date} className={fieldClass} />
      </label>
      <label className="min-w-0">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Doctor
        </span>
        <select name="doctor" defaultValue={doctorId ?? ""} className={fieldClass}>
          <option value="">All doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Status
        </span>
        <select name="status" defaultValue={status ?? ""} className={fieldClass}>
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {APPOINTMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full">
          {pending ? "Filtering…" : "Apply filters"}
        </Button>
      </div>
    </form>
  );
}
