"use client";

import { useActionState, useRef, useState } from "react";
import { Ban, CircleCheck, UserRoundX, type LucideIcon } from "lucide-react";
import { allowedStatusTransitions } from "@/domain/appointments/status";
import { FormError } from "@/components/admin/form-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/cn";
import { APPOINTMENT_STATUS_LABELS } from "@/server/appointments/labels";
import type { AppointmentStatus } from "@/types/database";
import type { CatalogFormState } from "../form-utils";
import { updateAppointmentStatusAction } from "./actions";

const initialState: CatalogFormState = {};

const ACTION_STYLE: Record<
  AppointmentStatus,
  { icon: LucideIcon; className: string }
> = {
  pending: {
    icon: CircleCheck,
    className: "border-warning/20 bg-warning-bg text-warning hover:border-warning/40",
  },
  confirmed: {
    icon: CircleCheck,
    className: "border-primary/20 bg-accent text-primary hover:border-primary/40",
  },
  completed: {
    icon: CircleCheck,
    className: "border-success/25 bg-success-bg text-success hover:border-success/40",
  },
  cancelled: {
    icon: Ban,
    className: "border-border bg-surface text-muted hover:border-danger/25 hover:bg-danger-bg hover:text-danger",
  },
  no_show: {
    icon: UserRoundX,
    className: "border-danger/20 bg-danger-bg text-danger hover:border-danger/40",
  },
};

const SETTLED: Partial<
  Record<AppointmentStatus, { icon: LucideIcon; label: string; className: string }>
> = {
  completed: {
    icon: CircleCheck,
    label: "Visit completed",
    className: "bg-success-bg text-success",
  },
  cancelled: {
    icon: Ban,
    label: "Cancelled",
    className: "bg-surface-muted text-muted",
  },
  no_show: {
    icon: UserRoundX,
    label: "Marked no-show",
    className: "bg-danger-bg text-danger",
  },
};

function confirmCopy(status: AppointmentStatus): { title: string; description: string } {
  if (status === "completed") {
    return {
      title: "Mark as completed?",
      description: "This visit will be closed as completed. You cannot undo this from here.",
    };
  }
  if (status === "cancelled") {
    return {
      title: "Cancel this appointment?",
      description: "The slot will be freed. You cannot undo this from here.",
    };
  }
  if (status === "no_show") {
    return {
      title: "Mark as no-show?",
      description: "Record that the patient did not attend. You cannot undo this from here.",
    };
  }
  return {
    title: `Mark as ${APPOINTMENT_STATUS_LABELS[status]}?`,
    description: `This will update the appointment status to ${APPOINTMENT_STATUS_LABELS[status]}.`,
  };
}

export function StatusForm({
  id,
  status,
  returnQuery,
}: {
  id: string;
  status: AppointmentStatus;
  returnQuery: string;
}) {
  const next = allowedStatusTransitions(status);
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(next[0] ?? status);
  const [state, formAction, pending] = useActionState(
    updateAppointmentStatusAction,
    initialState,
  );

  const settled = SETTLED[status];
  if (next.length === 0 && settled) {
    const Icon = settled.icon;
    return (
      <p
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          settled.className,
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        {settled.label}
      </p>
    );
  }

  if (next.length === 0) {
    return (
      <p className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
        Closed
      </p>
    );
  }

  const copy = confirmCopy(pendingStatus);
  const isCritical =
    pendingStatus === "cancelled" || pendingStatus === "no_show";

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="flex w-full flex-col items-stretch gap-1.5"
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="return_query" value={returnQuery} />
        <input type="hidden" name="status" value={pendingStatus} />
        <div className="flex flex-wrap gap-1.5">
          {next.map((value) => {
            const style = ACTION_STYLE[value];
            const Icon = style.icon;
            return (
              <button
                key={value}
                type="button"
                disabled={pending}
                onClick={() => {
                  setPendingStatus(value);
                  setConfirmOpen(true);
                }}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.className,
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {value === "completed"
                  ? "Complete"
                  : value === "confirmed"
                    ? "Confirm"
                    : APPOINTMENT_STATUS_LABELS[value]}
              </button>
            );
          })}
        </div>
        <FormError message={state.error} />
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title={copy.title}
        description={copy.description}
        confirmLabel={
          pendingStatus === "completed"
            ? "Complete visit"
            : pendingStatus === "cancelled"
              ? "Cancel appointment"
              : pendingStatus === "no_show"
                ? "Mark no-show"
                : "Update status"
        }
        tone={isCritical ? "danger" : "primary"}
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
