import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import { getOrganizationId, tryGetOrganizationId } from "@/server/tenant/getOrganizationId";
import { departmentInputSchema } from "./schemas";
import { uniqueOrgSlug } from "./unique-slug";
import {
  assertUniqueDepartmentName,
  throwIfUniqueViolation,
} from "./assert-unique";
import { DEPARTMENT_NAME_CONFLICT } from "./uniqueness";

export type Department = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function listDepartments(options?: {
  activeOnly?: boolean;
}): Promise<Department[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return [];
  }
  const supabase = await createClient();
  let query = supabase
    .from("departments")
    .select("id, name, slug, description, sort_order, is_active")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })
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

export async function getDepartmentById(
  id: string,
): Promise<Department | null> {
  const organizationId = await getOrganizationId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, slug, description, sort_order, is_active")
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getDepartmentBySlug(
  slug: string,
): Promise<Department | null> {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, slug, description, sort_order, is_active")
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createDepartment(input: unknown): Promise<Department> {
  const parsed = departmentInputSchema.parse(input);
  const organizationId = await getOrganizationId();
  await assertUniqueDepartmentName(organizationId, parsed.name);
  const slug = await uniqueOrgSlug("departments", organizationId, parsed.name);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .insert({
      organization_id: organizationId,
      name: parsed.name,
      slug,
      description: parsed.description,
      sort_order: parsed.sort_order,
      is_active: parsed.is_active,
    })
    .select("id, name, slug, description, sort_order, is_active")
    .single();

  if (error || !data) {
    throwIfUniqueViolation(error, DEPARTMENT_NAME_CONFLICT);
    throw new Error(error?.message ?? "Could not create department.");
  }

  return data;
}

export async function updateDepartment(
  id: string,
  input: unknown,
): Promise<Department> {
  const parsed = departmentInputSchema.parse(input);
  const organizationId = await getOrganizationId();
  await assertUniqueDepartmentName(organizationId, parsed.name, id);
  const slug = await uniqueOrgSlug(
    "departments",
    organizationId,
    parsed.name,
    id,
  );
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .update({
      name: parsed.name,
      slug,
      description: parsed.description,
      sort_order: parsed.sort_order,
      is_active: parsed.is_active,
    })
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select("id, name, slug, description, sort_order, is_active")
    .maybeSingle();

  if (error) {
    throwIfUniqueViolation(error, DEPARTMENT_NAME_CONFLICT);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Department not found.");
  }

  return data;
}
