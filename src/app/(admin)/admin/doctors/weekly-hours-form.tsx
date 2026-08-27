"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
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
    <section className="mt-8 max-w-2xl rounded-xl border border-border bg-surface p-5 shadow-(--shadow-card) sm:p-6">
      <h2 className="text-base font-semibold text-foreground">Weekly hours</h2>
      <p className="mt-1 text-sm text-muted">
        Times are in {timezone.replace(/_/g, " ")}. Split around lunch as two
        intervals on the same day. Overnight shifts are not supported.
      </p>

      {readOnly ? (
        rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No weekly hours set.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground">
                  {WEEKDAYS.find((day) => day.value === row.weekday)?.label}
                </span>
                <span className="text-muted">
                  {row.start_time}–{row.end_time}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="doctor_id" value={doctorId} />
          {rows.length === 0 ? (
            <p className="text-sm text-muted">
              No intervals yet. Add at least one working window.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <Field label="Day">
                    <select
                      name="weekday"
                      value={row.weekday}
                      onChange={(event) => {
                        const weekday = Number(event.target.value);
                        setRows((current) =>
                          current.map((item) =>
                            item.key === row.key ? { ...item, weekday } : item,
                          ),
                        );
                      }}
                      className={fieldClass}
                    >
                      {WEEKDAYS.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </Field>
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
                    className="self-end"
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
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setRows((current) => [
                  ...current,
                  newRow(current.at(-1)?.weekday ?? 0),
                ])
              }
            >
              Add interval
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save weekly hours"}
            </Button>
          </div>
          <FormError message={state.error} />
        </form>
      )}
    </section>
  );
}
