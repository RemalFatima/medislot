import {
  Ban,
  CircleCheck,
  CircleDashed,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
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

const icons: Record<AppointmentStatus, LucideIcon> = {
  pending: CircleDashed,
  confirmed: CircleCheck,
  completed: CircleCheck,
  cancelled: Ban,
  no_show: UserRoundX,
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const Icon = icons[status];

  return (
    <Badge tone={tones[status]} className="gap-1">
      <Icon className="size-3" aria-hidden />
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
