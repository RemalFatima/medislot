import { describe, expect, it } from "vitest";
import { calculateSlots } from "./calculateSlots";
import type {
  OccupiedRange,
  SlotException,
  WeeklyWindow,
} from "./calculateSlots";
import { weekdayMonday0, zonedLocalToUtc } from "./timezone";

const DOCTOR = "11111111-1111-4111-8111-111111111111";
const KARACHI = "Asia/Karachi";
const NEW_YORK = "America/New_York";

const mondayWindows: WeeklyWindow[] = [
  { weekday: 0, start_time: "09:00:00", end_time: "17:00:00" },
];

function iso(slots: { startAt: Date; endAt: Date }[]) {
  return slots.map((slot) => slot.startAt.toISOString());
}

function local(
  timeZone: string,
  date: string,
  hour: number,
  minute = 0,
): Date {
  const [year, month, day] = date.split("-").map(Number);
  return zonedLocalToUtc(timeZone, year, month, day, hour, minute, 0);
}

describe("calculateSlots", () => {
  it("returns no slots when the doctor has no weekly windows", () => {
    const slots = calculateSlots({
      timezone: KARACHI,
      fromDate: "2026-08-24",
      toDate: "2026-08-24",
      durationMinutes: 30,
      bufferMinutes: 0,
      doctorId: DOCTOR,
      windows: [],
      exceptions: [],
      occupied: [],
      now: local(KARACHI, "2026-08-20", 8),
    });

    expect(slots).toEqual([]);
  });

  it("splits around a lunch break expressed as two windows", () => {
    const slots = calculateSlots({
      timezone: KARACHI,
      fromDate: "2026-08-24",
      toDate: "2026-08-24",
      durationMinutes: 60,
      bufferMinutes: 0,
      doctorId: DOCTOR,
      windows: [
        { weekday: 0, start_time: "09:00:00", end_time: "12:00:00" },
        { weekday: 0, start_time: "13:00:00", end_time: "17:00:00" },
      ],
      exceptions: [],
      occupied: [],
      now: local(KARACHI, "2026-08-20", 8),
    });

    expect(iso(slots)).toEqual([
      local(KARACHI, "2026-08-24", 9).toISOString(),
      local(KARACHI, "2026-08-24", 10).toISOString(),
      local(KARACHI, "2026-08-24", 11).toISOString(),
      local(KARACHI, "2026-08-24", 13).toISOString(),
      local(KARACHI, "2026-08-24", 14).toISOString(),
      local(KARACHI, "2026-08-24", 15).toISOString(),
      local(KARACHI, "2026-08-24", 16).toISOString(),
    ]);
  });

  it("closes the day for a clinic-wide holiday", () => {
    const holiday: SlotException = {
      doctor_id: null,
      date: "2026-08-24",
      type: "holiday",
      start_time: null,
      end_time: null,
    };

    const slots = calculateSlots({
      timezone: KARACHI,
      fromDate: "2026-08-24",
      toDate: "2026-08-24",
      durationMinutes: 30,
      bufferMinutes: 0,
      doctorId: DOCTOR,
      windows: mondayWindows,
      exceptions: [holiday],
      occupied: [],
      now: local(KARACHI, "2026-08-20", 8),
    });

    expect(slots).toEqual([]);
  });

  it("replaces weekly hours with special hours", () => {
    const slots = calculateSlots({
      timezone: KARACHI,
      fromDate: "2026-08-24",
      toDate: "2026-08-24",
      durationMinutes: 30,
      bufferMinutes: 0,
      doctorId: DOCTOR,
      windows: mondayWindows,
      exceptions: [
        {
          doctor_id: DOCTOR,
          date: "2026-08-24",
          type: "special_hours",
          start_time: "10:00:00",
          end_time: "11:00:00",
        },
      ],
      occupied: [],
      now: local(KARACHI, "2026-08-20", 8),
    });

    expect(iso(slots)).toEqual([
      local(KARACHI, "2026-08-24", 10).toISOString(),
      local(KARACHI, "2026-08-24", 10, 30).toISOString(),
    ]);
  });

  it("blocks slots that overlap an occupied appointment including buffer", () => {
    const occupied: OccupiedRange[] = [
      {
        startAt: local(KARACHI, "2026-08-24", 9),
        occupiedEndAt: local(KARACHI, "2026-08-24", 9, 45),
      },
    ];

    const slots = calculateSlots({
      timezone: KARACHI,
      fromDate: "2026-08-24",
      toDate: "2026-08-24",
      durationMinutes: 30,
      bufferMinutes: 15,
      doctorId: DOCTOR,
      windows: [
        { weekday: 0, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [],
      occupied,
      now: local(KARACHI, "2026-08-20", 8),
    });

    expect(iso(slots)).toEqual([
      local(KARACHI, "2026-08-24", 10).toISOString(),
      local(KARACHI, "2026-08-24", 10, 30).toISOString(),
      local(KARACHI, "2026-08-24", 11).toISOString(),
      local(KARACHI, "2026-08-24", 11, 30).toISOString(),
    ]);
  });

  it("does not emit consultation starts in the past", () => {
    const slots = calculateSlots({
      timezone: KARACHI,
      fromDate: "2026-08-24",
      toDate: "2026-08-24",
      durationMinutes: 60,
      bufferMinutes: 0,
      doctorId: DOCTOR,
      windows: [
        { weekday: 0, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [],
      occupied: [],
      now: local(KARACHI, "2026-08-24", 10, 1),
    });

    expect(iso(slots)).toEqual([
      local(KARACHI, "2026-08-24", 11).toISOString(),
    ]);
  });

  it("interprets local times with the correct DST offset", () => {
    const winter = calculateSlots({
      timezone: NEW_YORK,
      fromDate: "2026-01-15",
      toDate: "2026-01-15",
      durationMinutes: 30,
      bufferMinutes: 0,
      doctorId: DOCTOR,
      windows: [
        { weekday: 3, start_time: "09:00:00", end_time: "09:30:00" },
      ],
      exceptions: [],
      occupied: [],
      now: local(NEW_YORK, "2026-01-01", 8),
    });

    const summer = calculateSlots({
      timezone: NEW_YORK,
      fromDate: "2026-07-16",
      toDate: "2026-07-16",
      durationMinutes: 30,
      bufferMinutes: 0,
      doctorId: DOCTOR,
      windows: [
        { weekday: 3, start_time: "09:00:00", end_time: "09:30:00" },
      ],
      exceptions: [],
      occupied: [],
      now: local(NEW_YORK, "2026-07-01", 8),
    });

    expect(weekdayMonday0("2026-01-15", NEW_YORK)).toBe(3);
    expect(weekdayMonday0("2026-07-16", NEW_YORK)).toBe(3);
    expect(winter).toHaveLength(1);
    expect(summer).toHaveLength(1);
    expect(winter[0].startAt.toISOString()).toBe("2026-01-15T14:00:00.000Z");
    expect(summer[0].startAt.toISOString()).toBe("2026-07-16T13:00:00.000Z");
  });
});
