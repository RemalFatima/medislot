import { canTransitionStatus } from "@/domain/appointments/status";
import { createClient } from "@/server/supabase/server";
import { getOrganizationId } from "@/server/tenant/getOrganizationId";
import { z } from "zod";

const updateStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum([
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ]),
});

export async function updateAppointmentStatus(input: unknown): Promise<void> {
  const parsed = updateStatusSchema.parse(input);
  const organizationId = await getOrganizationId();
  const supabase = await createClient();

  const { data: current, error: loadError } = await supabase
    .from("appointments")
    .select("id, status")
    .eq("organization_id", organizationId)
    .eq("id", parsed.id)
    .maybeSingle();

  if (loadError) {
    throw new Error(loadError.message);
  }

  if (!current) {
    throw new Error("Appointment not found.");
  }

  if (!canTransitionStatus(current.status, parsed.status)) {
    throw new Error("That status change is not allowed.");
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: parsed.status })
    .eq("organization_id", organizationId)
    .eq("id", parsed.id);

  if (error) {
    throw new Error(error.message);
  }
}
