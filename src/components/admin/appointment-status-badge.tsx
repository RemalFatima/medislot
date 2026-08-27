import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_LABELS } from "@/server/appointments/labels";
import type { AppointmentStatus } from "@/types/database";

const tones: Record<
  AppointmentStatus,
  "neutral" | "success" | "warning" | "danger" | "info" | "primary"
> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "neutral",
  no_show: "danger",
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return <Badge tone={tones[status]}>{APPOINTMENT_STATUS_LABELS[status]}</Badge>;
}
