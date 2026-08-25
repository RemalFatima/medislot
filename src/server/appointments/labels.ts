import type { AppointmentSource, AppointmentStatus } from "@/types/database";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const APPOINTMENT_SOURCE_LABELS: Record<AppointmentSource, string> = {
  public: "Online",
  admin: "Walk-in",
};
