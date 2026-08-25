import { z } from "zod";
import { timeToMinutes, normalizeTime } from "./constants";

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, "Enter a valid time")
  .transform(normalizeTime);

export const availabilityWindowSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    start_time: timeSchema,
    end_time: timeSchema,
  })
  .refine((window) => timeToMinutes(window.start_time) < timeToMinutes(window.end_time), {
    message: "End time must be after start time. Overnight shifts are not supported.",
    path: ["end_time"],
  });

export const weeklyScheduleSchema = z
  .array(availabilityWindowSchema)
  .superRefine((windows, context) => {
    const byDay = new Map<number, { start: number; end: number }[]>();

    for (const window of windows) {
      const start = timeToMinutes(window.start_time);
      const end = timeToMinutes(window.end_time);
      const existing = byDay.get(window.weekday) ?? [];

      if (existing.some((other) => start < other.end && other.start < end)) {
        context.addIssue({
          code: "custom",
          message: "Working intervals on the same day cannot overlap. Split around breaks as two rows.",
        });
        return;
      }

      existing.push({ start, end });
      byDay.set(window.weekday, existing);
    }
  });

const optionalTime = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  return value;
}, timeSchema.nullable());

export const exceptionInputSchema = z
  .object({
    doctor_id: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return value;
    }, z.uuid().nullable()),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date"),
    type: z.enum(["holiday", "leave", "special_hours", "unavailable"]),
    start_time: optionalTime,
    end_time: optionalTime,
    reason: z.preprocess((value) => {
      if (typeof value !== "string" || value.trim().length === 0) {
        return null;
      }
      return value.trim();
    }, z.string().max(500).nullable()),
  })
  .superRefine((exception, context) => {
    const hasStart = Boolean(exception.start_time);
    const hasEnd = Boolean(exception.end_time);

    if (exception.type === "special_hours" && (!hasStart || !hasEnd)) {
      context.addIssue({
        code: "custom",
        message: "Special hours need a start and end time.",
        path: ["start_time"],
      });
    }

    if (hasStart !== hasEnd) {
      context.addIssue({
        code: "custom",
        message: "Provide both start and end times, or leave both empty.",
        path: hasStart ? ["end_time"] : ["start_time"],
      });
    }

    if (
      exception.start_time &&
      exception.end_time &&
      timeToMinutes(exception.start_time) >= timeToMinutes(exception.end_time)
    ) {
      context.addIssue({
        code: "custom",
        message: "End time must be after start time.",
        path: ["end_time"],
      });
    }
  });
