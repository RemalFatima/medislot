export const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
] as const;

export const EXCEPTION_TYPES = [
  { value: "holiday", label: "Holiday" },
  { value: "leave", label: "Leave" },
  { value: "special_hours", label: "Special hours" },
  { value: "unavailable", label: "Unavailable" },
] as const;

export function weekdayLabel(weekday: number): string {
  return WEEKDAYS.find((day) => day.value === weekday)?.label ?? `Day ${weekday}`;
}

export function exceptionTypeLabel(type: string): string {
  return (
    EXCEPTION_TYPES.find((entry) => entry.value === type)?.label ?? type
  );
}

export function normalizeTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return value;
  }

  return `${match[1].padStart(2, "0")}:${match[2]}:${match[3] ?? "00"}`;
}

export function timeInputValue(value: string): string {
  return value.slice(0, 5);
}

export function timeToMinutes(value: string): number {
  const normalized = normalizeTime(value);
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}
