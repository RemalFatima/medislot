import { CatalogConflictError } from "./errors";
import {
  DEPARTMENT_NAME_CONFLICT,
  DOCTOR_IDENTITY_CONFLICT,
  SERVICE_NAME_CONFLICT,
  doctorIdentityKey,
  labelsMatch,
} from "./uniqueness";
import { createClient } from "@/server/supabase/server";

function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}

export function throwIfUniqueViolation(
  error: { code?: string } | null | undefined,
  message: string,
): void {
  if (isUniqueViolation(error)) {
    throw new CatalogConflictError(message);
  }
}

export async function assertUniqueDepartmentName(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  const duplicate = (data ?? []).find(
    (row) => row.id !== excludeId && labelsMatch(row.name, name),
  );

  if (duplicate) {
    throw new CatalogConflictError(DEPARTMENT_NAME_CONFLICT);
  }
}

export async function assertUniqueServiceName(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name")
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  const duplicate = (data ?? []).find(
    (row) => row.id !== excludeId && labelsMatch(row.name, name),
  );

  if (duplicate) {
    throw new CatalogConflictError(SERVICE_NAME_CONFLICT);
  }
}

export async function assertUniqueDoctorIdentity(
  organizationId: string,
  input: {
    fullName: string;
    profession: string;
    specialization: string | null;
  },
  excludeId?: string,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("id, full_name, profession, specialization")
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  const incoming = doctorIdentityKey(
    input.fullName,
    input.profession,
    input.specialization,
  );
  const duplicate = (data ?? []).find((row) => {
    if (row.id === excludeId) {
      return false;
    }
    return (
      doctorIdentityKey(row.full_name, row.profession, row.specialization) ===
      incoming
    );
  });

  if (duplicate) {
    throw new CatalogConflictError(DOCTOR_IDENTITY_CONFLICT);
  }
}
