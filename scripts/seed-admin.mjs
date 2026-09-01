import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEMO_ORGANIZATION_ID = "a0000000-0000-4000-8000-000000000001";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const text = readFileSync(filePath, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const adminEmail = requireEnv("SEED_ADMIN_EMAIL");
const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
const organizationId = process.env.ORGANIZATION_ID ?? DEMO_ORGANIZATION_ID;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: organization, error: organizationError } = await supabase
  .from("organizations")
  .select("id, name")
  .eq("id", organizationId)
  .maybeSingle();

if (organizationError) {
  throw organizationError;
}

if (!organization) {
  throw new Error(
    `Organization ${organizationId} was not found. Apply supabase/seed.sql first.`,
  );
}

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email: adminEmail,
  password: adminPassword,
  email_confirm: true,
});

let userId = created?.user?.id;

if (createError) {
  const duplicate =
    createError.message?.toLowerCase().includes("already") ||
    createError.status === 422;

  if (!duplicate) {
    throw createError;
  }

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw listError;
  }

  const existing = list.users.find(
    (user) => user.email?.toLowerCase() === adminEmail.toLowerCase(),
  );

  if (!existing) {
    throw new Error(
      "Admin email already exists in Auth but could not be looked up. Create the organization_members row manually.",
    );
  }

  userId = existing.id;

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      password: adminPassword,
      email_confirm: true,
    },
  );

  if (updateError) {
    throw updateError;
  }
}

if (!userId) {
  throw new Error("Could not resolve the admin user id.");
}

const { error: membershipError } = await supabase
  .from("organization_members")
  .upsert(
    {
      organization_id: organizationId,
      user_id: userId,
      role: "owner",
      is_active: true,
    },
    { onConflict: "organization_id,user_id" },
  );

if (membershipError) {
  throw membershipError;
}

console.log(
  `Seeded admin ${adminEmail} for ${organization.name} (${organizationId}).`,
);
