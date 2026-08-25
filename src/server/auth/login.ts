import { createClient } from "@/server/supabase/server";
import { getOrganizationId } from "@/server/tenant/getOrganizationId";
import { loginSchema } from "./schemas";

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

export async function loginWithPassword(input: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { ok: false, error: "Invalid email or password." };
  }

  const organizationId = await getOrganizationId();

  const { data: member } = await supabase
    .from("staff_members")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .maybeSingle();

  if (!member) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "This account is not an active staff member for this clinic.",
    };
  }

  return { ok: true };
}
