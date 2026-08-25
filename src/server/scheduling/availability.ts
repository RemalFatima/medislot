import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import {
  getOrganizationId,
  tryGetOrganizationId,
} from "@/server/tenant/getOrganizationId";
import { weeklyScheduleSchema } from "./schemas";

export type AvailabilityWindow = {
  id: string;
  doctor_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export async function listDoctorAvailability(
  doctorId: string,
): Promise<AvailabilityWindow[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("id, doctor_id, weekday, start_time, end_time, is_active")
    .eq("organization_id", organizationId)
    .eq("doctor_id", doctorId)
    .eq("is_active", true)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function replaceDoctorAvailability(
  doctorId: string,
  input: unknown,
): Promise<AvailabilityWindow[]> {
  const windows = weeklyScheduleSchema.parse(input);
  const organizationId = await getOrganizationId();
  const supabase = await createClient();

  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", doctorId)
    .maybeSingle();

  if (doctorError) {
    throw new Error(doctorError.message);
  }

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const { error: deleteError } = await supabase
    .from("doctor_availability")
    .delete()
    .eq("organization_id", organizationId)
    .eq("doctor_id", doctorId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (windows.length === 0) {
    return [];
  }

  const { error: insertError } = await supabase.from("doctor_availability").insert(
    windows.map((window) => ({
      organization_id: organizationId,
      doctor_id: doctorId,
      weekday: window.weekday,
      start_time: window.start_time,
      end_time: window.end_time,
      is_active: true,
    })),
  );

  if (insertError) {
    throw new Error(insertError.message);
  }

  return listDoctorAvailability(doctorId);
}
