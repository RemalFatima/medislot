import { Badge } from "@/components/ui/badge";

export function VisibilityBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "success" : "neutral"}>
      {active ? "Active" : "Hidden"}
    </Badge>
  );
}
