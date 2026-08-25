import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import { tryGetOrganizationId } from "@/server/tenant/getOrganizationId";

export async function getOrganizationTimezone(): Promise<string> {
  if (!hasSupabasePublicEnv()) {
    return "UTC";
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return "UTC";
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("timezone")
    .eq("id", organizationId)
    .maybeSingle();

  return data?.timezone ?? "UTC";
}
