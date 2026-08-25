import { createClient } from "@/server/supabase/server";
import { slugify } from "./slugify";

type SlugTable = "departments" | "doctors" | "services";

export async function uniqueOrgSlug(
  table: SlugTable,
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<string> {
  const supabase = await createClient();
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (suffix < 50) {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.id === excludeId) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  throw new Error("Could not allocate a unique slug.");
}
