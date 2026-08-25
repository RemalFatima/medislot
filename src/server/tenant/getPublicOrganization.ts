import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import { tryGetOrganizationId } from "@/server/tenant/getOrganizationId";

export async function getPublicOrganization(): Promise<{
  name: string;
  slug: string;
} | null> {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
