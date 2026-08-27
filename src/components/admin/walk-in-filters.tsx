"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";

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
    <form
      method="get"
      onSubmit={() => setPending(true)}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="min-w-0">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Doctor</span>
        <select name="doctor" defaultValue={selectedDoctorId} className={fieldClass}>
          {doctors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.full_name}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Service</span>
        <select name="service" defaultValue={selectedServiceId} className={fieldClass}>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration_minutes} min)
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-0">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Date</span>
        <input
          type="date"
          name="date"
          min={today}
          max={maxDate}
          defaultValue={date}
          className={fieldClass}
        />
      </label>
      <div className="flex items-end">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full">
          {pending ? "Loading times…" : "Show times"}
        </Button>
      </div>
    </form>
  );
}
