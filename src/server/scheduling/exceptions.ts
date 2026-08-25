import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import { getOrganizationId, tryGetOrganizationId } from "@/server/tenant/getOrganizationId";
import type { ExceptionType } from "@/types/database";
import { exceptionInputSchema } from "./schemas";

export type AvailabilityException = {
  id: string;
  doctor_id: string | null;
  date: string;
  type: ExceptionType;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

export async function listExceptions(options?: {
  doctorId?: string | null;
}): Promise<AvailabilityException[]> {
  const organizationId = await getOrganizationId();
  const supabase = await createClient();
  let query = supabase
    .from("availability_exceptions")
    .select("id, doctor_id, date, type, start_time, end_time, reason")
    .eq("organization_id", organizationId)
    .order("date", { ascending: true });

  if (options?.doctorId === null) {
    query = query.is("doctor_id", null);
  } else if (options?.doctorId) {
    query = query.eq("doctor_id", options.doctorId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listRelevantExceptions(
  doctorId: string,
  fromDate: string,
  toDate: string,
): Promise<AvailabilityException[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_exceptions")
    .select("id, doctor_id, date, type, start_time, end_time, reason")
    .eq("organization_id", organizationId)
    .gte("date", fromDate)
    .lte("date", toDate)
    .or(`doctor_id.is.null,doctor_id.eq.${doctorId}`)
    .order("date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createException(
  input: unknown,
): Promise<AvailabilityException> {
  const parsed = exceptionInputSchema.parse(input);
  const organizationId = await getOrganizationId();
  const supabase = await createClient();

  if (parsed.doctor_id) {
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("id", parsed.doctor_id)
      .maybeSingle();

    if (doctorError) {
      throw new Error(doctorError.message);
    }

    if (!doctor) {
      throw new Error("Doctor not found.");
    }
  }

  const { data, error } = await supabase
    .from("availability_exceptions")
    .insert({
      organization_id: organizationId,
      doctor_id: parsed.doctor_id,
      date: parsed.date,
      type: parsed.type,
      start_time: parsed.start_time,
      end_time: parsed.end_time,
      reason: parsed.reason,
    })
    .select("id, doctor_id, date, type, start_time, end_time, reason")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("A clinic-wide exception already exists for that date.");
    }
    throw new Error(error?.message ?? "Could not save the exception.");
  }

  return data;
}

export async function deleteException(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability_exceptions")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
