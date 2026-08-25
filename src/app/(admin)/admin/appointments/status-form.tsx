"use client";

import { useActionState } from "react";
import { allowedStatusTransitions } from "@/domain/appointments/status";
import { APPOINTMENT_STATUS_LABELS } from "@/server/appointments/labels";
import type { AppointmentStatus } from "@/types/database";
import type { CatalogFormState } from "../form-utils";
import { updateAppointmentStatusAction } from "./actions";

const initialState: CatalogFormState = {};

export function StatusForm({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const next = allowedStatusTransitions(status);
  const [state, formAction, pending] = useActionState(
    updateAppointmentStatusAction,
    initialState,
  );

  if (next.length === 0) {
    return (
      <span className="text-xs text-zinc-500">
        {APPOINTMENT_STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <div className="flex gap-2">
        <select
          name="status"
          defaultValue={next[0]}
          className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-900"
        >
          {next.map((value) => (
            <option key={value} value={value}>
              {APPOINTMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-md border border-zinc-300 px-2 text-xs text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Update"}
        </button>
      </div>
      {state.error ? (
        <p className="text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
