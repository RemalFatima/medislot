import { DoorOpen, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_SOURCE_LABELS } from "@/server/appointments/labels";
import type { AppointmentSource } from "@/types/database";

export function AppointmentSourceBadge({
  source,
}: {
  source: AppointmentSource;
}) {
  const walkIn = source === "admin";
  const Icon = walkIn ? DoorOpen : Globe;

  return (
    <Badge tone={walkIn ? "primary" : "neutral"} className="gap-1">
      <Icon className="size-3" aria-hidden />
      {APPOINTMENT_SOURCE_LABELS[source]}
    </Badge>
  );
}
