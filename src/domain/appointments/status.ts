import type { AppointmentStatus } from "@/types/database";

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function allowedStatusTransitions(
  from: AppointmentStatus,
): AppointmentStatus[] {
  return TRANSITIONS[from];
}

export function canTransitionStatus(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}
