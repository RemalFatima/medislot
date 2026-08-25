import { createClient } from "@/server/supabase/server";
import { getOrganizationId } from "@/server/tenant/getOrganizationId";
import type { StaffContext } from "./types";

export async function getStaffContext(): Promise<StaffContext | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return null;
  }

  const organizationId = await getOrganizationId();

  const { data: member, error } = await supabase
    .from("staff_members")
    .select("organization_id, role, is_active")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !member) {
    return null;
  }

  const emailClaim = data.claims?.email;

  return {
    userId,
    email: typeof emailClaim === "string" ? emailClaim : undefined,
    organizationId: member.organization_id,
    role: member.role,
  };
}
