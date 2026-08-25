import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import {
  getOrganizationId,
  tryGetOrganizationId,
} from "@/server/tenant/getOrganizationId";
import type { OrganizationType } from "@/types/database";
import { organizationSettingsSchema } from "./schemas";

export type OrganizationBranding = {
  tagline: string | null;
  description: string | null;
};

export type OrganizationSettings = {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  timezone: string;
  locale: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  logo_url: string | null;
  is_active: boolean;
  branding: OrganizationBranding;
};

function parseBranding(raw: Record<string, unknown> | null): OrganizationBranding {
  const tagline = raw && typeof raw.tagline === "string" ? raw.tagline.trim() : "";
  const description =
    raw && typeof raw.description === "string" ? raw.description.trim() : "";
  return {
    tagline: tagline.length > 0 ? tagline : null,
    description: description.length > 0 ? description : null,
  };
}

function mapRow(row: {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  timezone: string;
  locale: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  logo_url: string | null;
  is_active: boolean;
  branding: Record<string, unknown>;
}): OrganizationSettings {
  return {
    ...row,
    branding: parseBranding(row.branding),
  };
}

const SELECT =
  "id, name, slug, type, timezone, locale, phone, email, address, city, logo_url, is_active, branding";

export async function getOrganizationSettings(): Promise<OrganizationSettings | null> {
  const organizationId = await getOrganizationId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(SELECT)
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data) : null;
}

export async function getPublicOrganization(): Promise<OrganizationSettings | null> {
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
    .select(SELECT)
    .eq("id", organizationId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRow(data);
}

export async function updateOrganizationSettings(
  input: unknown,
): Promise<OrganizationSettings> {
  const parsed = organizationSettingsSchema.parse(input);
  const organizationId = await getOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .update({
      name: parsed.name,
      type: parsed.type,
      timezone: parsed.timezone,
      locale: parsed.locale,
      phone: parsed.phone,
      email: parsed.email,
      address: parsed.address,
      city: parsed.city,
      logo_url: parsed.logo_url,
      is_active: parsed.is_active,
      branding: {
        tagline: parsed.tagline,
        description: parsed.description,
      },
    })
    .eq("id", organizationId)
    .select(SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Organization not found.");
  }

  return mapRow(data);
}
