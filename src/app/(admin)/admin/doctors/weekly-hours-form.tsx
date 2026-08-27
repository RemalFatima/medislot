"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Field, fieldClass, ValidatedForm } from "@/components/ui/field";
import type { AvailabilityWindow } from "@/server/scheduling/availability";
import { timeInputValue, WEEKDAYS } from "@/server/scheduling/constants";
import type { CatalogFormState } from "../form-utils";
import { saveDoctorAvailabilityAction } from "../scheduling-actions";

const initialState: CatalogFormState = {};

type WindowRow = {
  key: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

function toRows(windows: AvailabilityWindow[]): WindowRow[] {
  return windows.map((window) => ({
    key: window.id,
    weekday: window.weekday,
    start_time: timeInputValue(window.start_time),
    end_time: timeInputValue(window.end_time),
  }));
}

function newRow(weekday = 0): WindowRow {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `row-${weekday}-${Date.now()}`,
    weekday,
    start_time: "09:00",
    end_time: "17:00",
  };
}

function rowsForDay(rows: WindowRow[], weekday: number) {
  return rows
    .filter((row) => row.weekday === weekday)
    .slice()
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function WeeklyHoursForm({
  doctorId,
  windows,
  timezone,
  readOnly,
}: {
  doctorId: string;
  windows: AvailabilityWindow[];
  timezone: string;
  readOnly: boolean;
}) {
  const [rows, setRows] = useState<WindowRow[]>(() => toRows(windows));
  const [state, formAction, pending] = useActionState(
    saveDoctorAvailabilityAction,
    initialState,
  );

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-(--shadow-card) sm:p-6">
      <h2 className="text-base font-semibold text-foreground">Weekly hours</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Times are in {timezone.replace(/_/g, " ")}. Add two intervals on the same
        day to leave a break (for example 09:00–13:00 and 14:00–17:00). Overnight
        shifts are not supported.
      </p>

      {readOnly ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {WEEKDAYS.map((day) => {
            const dayRows = rowsForDay(rows, day.value);
            return (
              <div
                key={day.value}
                className="rounded-lg border border-border bg-background px-3 py-3"
              >
                <p className="text-sm font-semibold text-foreground">{day.label}</p>
                {dayRows.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">Not scheduled</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {dayRows.map((row, index) => (
                      <li key={row.key}>
                        {row.start_time}–{row.end_time}
                        {index > 0 ? (
                          <span className="block text-xs text-muted">after break</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <ValidatedForm action={formAction} className="mt-5 flex flex-col gap-3">
          <input type="hidden" name="doctor_id" value={doctorId} />
          {WEEKDAYS.map((day) => {
            const dayRows = rowsForDay(rows, day.value);
            return (
              <div
                key={day.value}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">{day.label}</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setRows((current) => [...current, newRow(day.value)])
                    }
                  >
                    Add hours
                  </Button>
                </div>
                {dayRows.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">Not scheduled</p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {dayRows.map((row, index) => (
                      <div
                        key={row.key}
                        className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3"
                      >
                        <p className="text-xs font-medium text-muted">
                          {index === 0 ? "Working hours" : "After break"}
                        </p>
                        <input type="hidden" name="weekday" value={row.weekday} />
                        <Field label="Start">
                          <input
                            type="time"
                            name="start_time"
                            required
                            value={row.start_time}
                            onChange={(event) => {
                              const start_time = event.target.value;
                              setRows((current) =>
                                current.map((item) =>
                                  item.key === row.key
                                    ? { ...item, start_time }
                                    : item,
                                ),
                              );
                            }}
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="End">
                          <input
                            type="time"
                            name="end_time"
                            required
                            value={row.end_time}
                            onChange={(event) => {
                              const end_time = event.target.value;
                              setRows((current) =>
                                current.map((item) =>
                                  item.key === row.key ? { ...item, end_time } : item,
                                ),
                              );
                            }}
                            className={fieldClass}
                          />
                        </Field>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setRows((current) =>
                              current.filter((item) => item.key !== row.key),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="pt-1">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save weekly hours"}
            </Button>
          </div>
          <FormError message={state.error} />
        </ValidatedForm>
      )}
    </section>
  );
}
