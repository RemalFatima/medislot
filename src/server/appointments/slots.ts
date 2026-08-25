import { calculateSlots } from "@/domain/availability";
import {
  addCalendarDays,
  parseDateParts,
} from "@/domain/availability/time";
import {
  calendarDateInTimeZone,
  zonedLocalToUtc,
} from "@/domain/availability/timezone";
import { getDoctorById } from "@/server/catalog/doctors";
import { listDoctorAvailability } from "@/server/scheduling/availability";
import { listRelevantExceptions } from "@/server/scheduling/exceptions";
import { createClient } from "@/server/supabase/server";
import { hasSupabasePublicEnv } from "@/server/supabase/env";
import { tryGetOrganizationId } from "@/server/tenant/getOrganizationId";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import { BOOKING_HORIZON_DAYS } from "./constants";

export type PublicSlot = {
  startAt: string;
  endAt: string;
};

function parseDate(iso: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

export function bookingDateBounds(timezone: string, now = new Date()) {
  const today = calendarDateInTimeZone(now, timezone);
  const maxDate = addCalendarDays(today, BOOKING_HORIZON_DAYS);
  return { today, maxDate };
}

export function clampBookingDate(
  date: string | undefined,
  timezone: string,
  now = new Date(),
): string {
  const { today, maxDate } = bookingDateBounds(timezone, now);
  const parsed = date ? parseDate(date) : null;
  if (!parsed || parsed < today) {
    return today;
  }
  if (parsed > maxDate) {
    return maxDate;
  }
  return parsed;
}

async function listOccupied(
  doctorId: string,
  fromDate: string,
  toDate: string,
  timezone: string,
) {
  const supabase = await createClient();
  const fromParts = parseDateParts(fromDate);
  const toExclusive = addCalendarDays(toDate, 1);
  const toParts = parseDateParts(toExclusive);
  const { data, error } = await supabase.rpc("list_occupied_ranges", {
    p_doctor_id: doctorId,
    p_from: zonedLocalToUtc(
      timezone,
      fromParts.year,
      fromParts.month,
      fromParts.day,
      0,
      0,
      0,
    ).toISOString(),
    p_to: zonedLocalToUtc(
      timezone,
      toParts.year,
      toParts.month,
      toParts.day,
      0,
      0,
      0,
    ).toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    startAt: new Date(row.start_at),
    occupiedEndAt: new Date(row.occupied_end_at),
  }));
}

export async function getAvailableSlots(options: {
  doctorId: string;
  serviceId: string;
  date: string;
}): Promise<PublicSlot[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const organizationId = await tryGetOrganizationId();
  if (!organizationId) {
    return [];
  }

  const doctor = await getDoctorById(options.doctorId);
  if (!doctor || !doctor.is_active) {
    return [];
  }

  const service = doctor.services.find((item) => item.id === options.serviceId);
  if (!service) {
    return [];
  }

  const timezone = await getOrganizationTimezone();
  const date = clampBookingDate(options.date, timezone);
  const [windows, exceptions, occupied] = await Promise.all([
    listDoctorAvailability(doctor.id),
    listRelevantExceptions(doctor.id, date, date),
    listOccupied(doctor.id, date, date, timezone),
  ]);

  return calculateSlots({
    timezone,
    fromDate: date,
    toDate: date,
    durationMinutes: service.duration_minutes,
    bufferMinutes: doctor.buffer_minutes,
    doctorId: doctor.id,
    windows,
    exceptions: exceptions.map((exception) => ({
      doctor_id: exception.doctor_id,
      date: exception.date.slice(0, 10),
      type: exception.type,
      start_time: exception.start_time,
      end_time: exception.end_time,
    })),
    occupied,
  }).map((slot) => ({
    startAt: slot.startAt.toISOString(),
    endAt: slot.endAt.toISOString(),
  }));
}
