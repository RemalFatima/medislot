import { z } from "zod";

const organizationIdSchema = z.uuid();

function resolveFromEnvironment(): string {
  const parsed = organizationIdSchema.safeParse(process.env.ORGANIZATION_ID);

  if (!parsed.success) {
    throw new Error(
      "ORGANIZATION_ID is not configured or is not a valid UUID.",
    );
  }

  return parsed.data;
}

/**
 * Resolves the current tenant on the server.
 *
 * V1: read ORGANIZATION_ID from the server environment.
 * Future SaaS: resolve from hostname / custom domain here.
 *
 * Never accept organization_id from a client form, query string, or request body.
 */
export async function getOrganizationId(): Promise<string> {
  return resolveFromEnvironment();
}

/** Returns null when ORGANIZATION_ID is missing or invalid. */
export async function tryGetOrganizationId(): Promise<string | null> {
  const parsed = organizationIdSchema.safeParse(process.env.ORGANIZATION_ID);
  return parsed.success ? parsed.data : null;
}

