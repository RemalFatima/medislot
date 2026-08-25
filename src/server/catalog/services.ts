import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import { getOrganizationId, tryGetOrganizationId } from "@/server/tenant/getOrganizationId";
import { serviceInputSchema } from "./schemas";
import { uniqueOrgSlug } from "./unique-slug";

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
};

export async function listServices(options?: {
  activeOnly?: boolean;
}): Promise<Service[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return [];
  }
  const supabase = await createClient();
  let query = supabase
    .from("services")
    .select("id, name, slug, description, duration_minutes, price, is_active")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const organizationId = await getOrganizationId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, slug, description, duration_minutes, price, is_active")
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createService(input: unknown): Promise<Service> {
  const parsed = serviceInputSchema.parse(input);
  const organizationId = await getOrganizationId();
  const slug = await uniqueOrgSlug("services", organizationId, parsed.name);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .insert({
      organization_id: organizationId,
      name: parsed.name,
      slug,
      description: parsed.description,
      duration_minutes: parsed.duration_minutes,
      price: parsed.price,
      is_active: parsed.is_active,
    })
    .select("id, name, slug, description, duration_minutes, price, is_active")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create service.");
  }

  return data;
}

export async function updateService(
  id: string,
  input: unknown,
): Promise<Service> {
  const parsed = serviceInputSchema.parse(input);
  const organizationId = await getOrganizationId();
  const slug = await uniqueOrgSlug("services", organizationId, parsed.name, id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .update({
      name: parsed.name,
      slug,
      description: parsed.description,
      duration_minutes: parsed.duration_minutes,
      price: parsed.price,
      is_active: parsed.is_active,
    })
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select("id, name, slug, description, duration_minutes, price, is_active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Service not found.");
  }

  return data;
}
