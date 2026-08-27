"use client";

import { useActionState } from "react";
import { allowedStatusTransitions } from "@/domain/appointments/status";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_LABELS } from "@/server/appointments/labels";
import type { AppointmentStatus } from "@/types/database";
import type { CatalogFormState } from "../form-utils";
import { updateAppointmentStatusAction } from "./actions";

const initialState: CatalogFormState = {};

const selectClass =
  "h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-2 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-(--ring) sm:h-9 sm:w-40";

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
    return <p className="text-xs text-muted">No further actions</p>;
  }

  return (
    <form action={formAction} className="flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-end">
      <input type="hidden" name="id" value={id} />
      <div className="flex gap-2">
        <select name="status" defaultValue={next[0]} className={selectClass}>
          {next.map((value) => (
            <option key={value} value={value}>
              {APPOINTMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="sm" disabled={pending} className="h-11 sm:h-9">
          {pending ? "Saving…" : "Update"}
        </Button>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
