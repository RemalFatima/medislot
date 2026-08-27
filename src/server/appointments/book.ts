import { calendarDateInTimeZone } from "@/domain/availability/timezone";
import { getStaffContext } from "@/server/auth/getStaffContext";
import { getDoctorById } from "@/server/catalog/doctors";
import { onAppointmentCreated } from "@/server/notifications/onAppointmentCreated";
import { createClient } from "@/server/supabase/server";
import { getOrganizationId } from "@/server/tenant/getOrganizationId";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { SlotUnavailableError, DuplicateBookingError, normalizePhone } from "./errors";
import { bookAppointmentSchema } from "./schemas";
import { clampBookingDate, getAvailableSlots } from "./slots";

export type BookedAppointment = {
  id: string;
  confirmation_token: string;
  start_at: string;
  end_at: string;
  status: "confirmed" | "pending" | "completed" | "cancelled" | "no_show";
};

export type PublicBooking = {
  confirmation_token: string;
  status: BookedAppointment["status"];
  start_at: string;
  end_at: string;
  patient_name: string;
  doctor_name: string;
  service_name: string;
  organization_name: string;
  timezone: string;
};

function rpcRows<T>(data: T[] | T | null | undefined): T[] {
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

export async function bookAppointment(
  input: unknown,
): Promise<BookedAppointment> {
  const parsed = bookAppointmentSchema.parse(input);
  const organizationId = await getOrganizationId();
  const doctor = await getDoctorById(parsed.doctor_id);

  if (
    !doctor ||
    !doctor.is_active ||
    doctor.services.every((service) => service.id !== parsed.service_id)
  ) {
    throw new SlotUnavailableError();
  }

  const timezone = await getOrganizationTimezone();
  const start = new Date(parsed.start_at);
  if (Number.isNaN(start.getTime())) {
    throw new SlotUnavailableError();
  }

  const date = clampBookingDate(
    calendarDateInTimeZone(start, timezone),
    timezone,
  );
  const slots = await getAvailableSlots({
    doctorId: doctor.id,
    serviceId: parsed.service_id,
    date,
  });

  if (!slots.some((slot) => slot.startAt === parsed.start_at)) {
    throw new SlotUnavailableError();
  }

  if (parsed.source === "admin") {
    const staff = await getStaffContext();
    if (!staff) {
      throw new Error("You do not have permission to create a walk-in.");
    }
  }

  const supabase = await createClient();
  const { data: existingVisits, error: existingError } = await supabase
    .from("appointments")
    .select("patient_phone")
    .eq("organization_id", organizationId)
    .eq("doctor_id", parsed.doctor_id)
    .eq("start_at", parsed.start_at)
    .in("status", ["pending", "confirmed"]);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const incomingPhone = normalizePhone(parsed.patient_phone);
  if (
    (existingVisits ?? []).some(
      (row) => normalizePhone(row.patient_phone) === incomingPhone,
    )
  ) {
    throw new DuplicateBookingError();
  }

  const { data, error } = await supabase.rpc("book_appointment", {
    p_doctor_id: parsed.doctor_id,
    p_service_id: parsed.service_id,
    p_start_at: parsed.start_at,
    p_patient_name: parsed.patient_name,
    p_patient_phone: parsed.patient_phone,
    p_patient_email: parsed.patient_email,
    p_source: parsed.source,
  });

  const booked = rpcRows(data)[0];
  if (error || !booked) {
    const message = error?.message ?? "";
    if (message.includes("SLOT_UNAVAILABLE") || error?.code === "P0002") {
      throw new SlotUnavailableError();
    }
    throw new Error(error?.message ?? "Could not complete the booking.");
  }

  await onAppointmentCreated({
    appointmentId: booked.id,
    organizationId,
  });

  if (parsed.source === "admin" && parsed.notes) {
    const { error: notesError } = await supabase
      .from("appointments")
      .update({ notes: parsed.notes })
      .eq("organization_id", organizationId)
      .eq("id", booked.id);

    if (notesError) {
      throw new Error(notesError.message);
    }
  }

  return booked;
}

export async function getBookingByToken(
  token: string,
): Promise<PublicBooking | null> {
  if (!token || token.length < 16) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_booking_by_token", {
    p_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  return rpcRows(data)[0] ?? null;
}
