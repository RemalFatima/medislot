import { addCalendarDays, parseDateParts } from "@/domain/availability/time";
import {
  calendarDateInTimeZone,
  weekdayMonday0,
  zonedLocalToUtc,
} from "@/domain/availability/timezone";
import { listDoctors } from "@/server/catalog/doctors";
import { createClient } from "@/server/supabase/server";
import { getOrganizationId } from "@/server/tenant/getOrganizationId";
import { getOrganizationTimezone } from "@/server/tenant/getOrganizationTimezone";
import type { AppointmentStatus } from "@/types/database";

export type StatusCount = {
  status: AppointmentStatus;
  count: number;
};

export type DoctorCount = {
  doctorId: string;
  name: string;
  count: number;
};

export type DashboardSummary = {
  timezone: string;
  today: string;
  weekStart: string;
  todayTotal: number;
  weekTotal: number;
  todayByStatus: StatusCount[];
  weekByDoctor: DoctorCount[];
};

const STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

function startOfUtcDay(isoDate: string, timezone: string): Date {
  const { year, month, day } = parseDateParts(isoDate);
  return zonedLocalToUtc(timezone, year, month, day, 0, 0, 0);
}

export async function getDashboardSummary(
  now = new Date(),
): Promise<DashboardSummary> {
  const organizationId = await getOrganizationId();
  const timezone = await getOrganizationTimezone();
  const today = calendarDateInTimeZone(now, timezone);
  const weekStart = addCalendarDays(today, -weekdayMonday0(today, timezone));
  const fromAt = startOfUtcDay(weekStart, timezone).toISOString();
  const toAt = startOfUtcDay(addCalendarDays(today, 1), timezone).toISOString();

  const supabase = await createClient();
  const [{ data, error }, doctors] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, status, doctor_id, start_at")
      .eq("organization_id", organizationId)
      .gte("start_at", fromAt)
      .lt("start_at", toAt),
    listDoctors(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const todayRows = rows.filter(
    (row) => calendarDateInTimeZone(new Date(row.start_at), timezone) === today,
  );

  const statusCounts = new Map<AppointmentStatus, number>(
    STATUSES.map((status) => [status, 0]),
  );
  for (const row of todayRows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }

  const doctorCounts = new Map<string, number>();
  for (const row of rows) {
    doctorCounts.set(row.doctor_id, (doctorCounts.get(row.doctor_id) ?? 0) + 1);
  }

  const nameById = new Map(doctors.map((doctor) => [doctor.id, doctor.full_name]));
  const weekByDoctor = [...doctorCounts.entries()]
    .map(([doctorId, count]) => ({
      doctorId,
      name: nameById.get(doctorId) ?? "Doctor",
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    timezone,
    today,
    weekStart,
    todayTotal: todayRows.length,
    weekTotal: rows.length,
    todayByStatus: STATUSES.map((status) => ({
      status,
      count: statusCounts.get(status) ?? 0,
    })),
    weekByDoctor,
  };
}
