import type { ExceptionType } from "@/types/database";
import {
  addCalendarDays,
  eachCalendarDate,
  minutesOfDay,
  mergeIntervals,
  parseDateParts,
  rangesOverlap,
  subtractInterval,
  timeToMinutes,
  type MinuteInterval,
} from "./time";
import { weekdayMonday0, zonedLocalToUtc } from "./timezone";

export type WeeklyWindow = {
  weekday: number;
  start_time: string;
  end_time: string;
};

export type SlotException = {
  doctor_id: string | null;
  date: string;
  type: ExceptionType;
  start_time: string | null;
  end_time: string | null;
};

export type OccupiedRange = {
  startAt: Date;
  occupiedEndAt: Date;
};

export type Slot = {
  startAt: Date;
  endAt: Date;
};

export type CalculateSlotsInput = {
  timezone: string;
  fromDate: string;
  toDate: string;
  durationMinutes: number;
  bufferMinutes: number;
  doctorId: string;
  windows: WeeklyWindow[];
  exceptions: SlotException[];
  occupied: OccupiedRange[];
  now?: Date;
};

const CLOSE_TYPES = new Set<ExceptionType>([
  "holiday",
  "leave",
  "unavailable",
]);

function appliesToDoctor(exception: SlotException, doctorId: string): boolean {
  return exception.doctor_id === null || exception.doctor_id === doctorId;
}

function intervalFromTimes(
  startTime: string,
  endTime: string,
): MinuteInterval {
  return {
    start: timeToMinutes(startTime),
    end: timeToMinutes(endTime),
  };
}

function workingWindowsForDate(
  date: string,
  timezone: string,
  doctorId: string,
  windows: WeeklyWindow[],
  exceptions: SlotException[],
): MinuteInterval[] {
  const dayExceptions = exceptions.filter(
    (exception) => exception.date === date && appliesToDoctor(exception, doctorId),
  );

  const doctorSpecial = dayExceptions.filter(
    (exception) =>
      exception.type === "special_hours" && exception.doctor_id === doctorId,
  );
  const clinicSpecial = dayExceptions.filter(
    (exception) =>
      exception.type === "special_hours" && exception.doctor_id === null,
  );
  const special = doctorSpecial.length > 0 ? doctorSpecial : clinicSpecial;

  let working: MinuteInterval[] = [];
  if (special.length > 0) {
    working = special
      .filter((exception) => exception.start_time && exception.end_time)
      .map((exception) =>
        intervalFromTimes(exception.start_time as string, exception.end_time as string),
      );
  } else {
    const weekday = weekdayMonday0(date, timezone);
    working = windows
      .filter((window) => window.weekday === weekday)
      .map((window) => intervalFromTimes(window.start_time, window.end_time));
  }

  working = mergeIntervals(working);

  const closes = dayExceptions.filter((exception) => CLOSE_TYPES.has(exception.type));
  if (closes.some((exception) => !exception.start_time && !exception.end_time)) {
    return [];
  }

  for (const close of closes) {
    if (close.start_time && close.end_time) {
      working = subtractInterval(
        working,
        intervalFromTimes(close.start_time, close.end_time),
      );
    }
  }

  return working;
}

function localMinutesToUtc(
  timezone: string,
  isoDate: string,
  minutes: number,
): Date {
  const { days, minute } = minutesOfDay(minutes);
  const date = days === 0 ? isoDate : addCalendarDays(isoDate, days);
  const { year, month, day } = parseDateParts(date);
  const hour = Math.floor(minute / 60);
  const minuteOfHour = minute % 60;
  return zonedLocalToUtc(timezone, year, month, day, hour, minuteOfHour, 0);
}

function isFree(
  startAt: Date,
  occupiedEndAt: Date,
  occupied: OccupiedRange[],
): boolean {
  return !occupied.some((range) =>
    rangesOverlap(
      startAt.getTime(),
      occupiedEndAt.getTime(),
      range.startAt.getTime(),
      range.occupiedEndAt.getTime(),
    ),
  );
}

/**
 * Compute bookable consultation starts from weekly windows, exceptions,
 * and occupied appointment ranges. Slots are not stored; callers pass
 * pending/confirmed appointments as `occupied`.
 */
export function calculateSlots(input: CalculateSlotsInput): Slot[] {
  if (input.durationMinutes < 1 || input.bufferMinutes < 0) {
    return [];
  }

  const now = input.now ?? new Date();
  const slots: Slot[] = [];

  for (const date of eachCalendarDate(input.fromDate, input.toDate)) {
    const windows = workingWindowsForDate(
      date,
      input.timezone,
      input.doctorId,
      input.windows,
      input.exceptions,
    );

    for (const window of windows) {
      for (
        let start = window.start;
        start + input.durationMinutes <= window.end;
        start += input.durationMinutes
      ) {
        const end = start + input.durationMinutes;
        const occupiedEnd = end + input.bufferMinutes;
        const startAt = localMinutesToUtc(input.timezone, date, start);
        const endAt = localMinutesToUtc(input.timezone, date, end);
        const occupiedEndAt = localMinutesToUtc(
          input.timezone,
          date,
          occupiedEnd,
        );

        if (startAt.getTime() < now.getTime()) {
          continue;
        }

        if (!isFree(startAt, occupiedEndAt, input.occupied)) {
          continue;
        }

        slots.push({ startAt, endAt });
      }
    }
  }

  return slots;
}
