import { addCalendarDays, parseDateParts } from "@/domain/availability/time";
import { zonedLocalToUtc } from "@/domain/availability/timezone";
import { createClient } from "@/server/supabase/server";
import { getOrganizationId } from "@/server/tenant/getOrganizationId";
import type { AppointmentSource, AppointmentStatus } from "@/types/database";

export type AppointmentListItem = {
  id: string;
  doctor_id: string;
  service_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes: string | null;
  confirmation_token: string;
};

export async function listAppointments(options: {
  date?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  timezone: string;
}): Promise<AppointmentListItem[]> {
  const organizationId = await getOrganizationId();
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select(
      "id, doctor_id, service_id, patient_name, patient_phone, patient_email, start_at, end_at, status, source, notes, confirmation_token",
    )
    .eq("organization_id", organizationId)
    .order("start_at", { ascending: true });

  if (options.date) {
    const fromParts = parseDateParts(options.date);
    const toParts = parseDateParts(addCalendarDays(options.date, 1));
    const fromAt = zonedLocalToUtc(
      options.timezone,
      fromParts.year,
      fromParts.month,
      fromParts.day,
      0,
      0,
      0,
    ).toISOString();
    const toAt = zonedLocalToUtc(
      options.timezone,
      toParts.year,
      toParts.month,
      toParts.day,
      0,
      0,
      0,
    ).toISOString();
    query = query.gte("start_at", fromAt).lt("start_at", toAt);
  }

  if (options.doctorId) {
    query = query.eq("doctor_id", options.doctorId);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
