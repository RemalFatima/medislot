/** Minutes from local midnight. */
export type MinuteInterval = {
  start: number;
  end: number;
};

export function parseDateParts(isoDate: string): {
  year: number;
  month: number;
  day: number;
} {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid date: ${isoDate}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function addCalendarDays(isoDate: string, days: number): string {
  const { year, month, day } = parseDateParts(isoDate);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

export function eachCalendarDate(fromDate: string, toDate: string): string[] {
  if (fromDate > toDate) {
    return [];
  }

  const dates: string[] = [];
  let current = fromDate;
  while (current <= toDate) {
    dates.push(current);
    current = addCalendarDays(current, 1);
  }
  return dates;
}

export function timeToMinutes(value: string): number {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    throw new Error(`Invalid time: ${value}`);
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function minutesOfDay(minutes: number): { days: number; minute: number } {
  const days = Math.floor(minutes / 1440);
  const minute = ((minutes % 1440) + 1440) % 1440;
  return { days, minute };
}

export function mergeIntervals(intervals: MinuteInterval[]): MinuteInterval[] {
  const sorted = [...intervals]
    .filter((interval) => interval.end > interval.start)
    .sort((a, b) => a.start - b.start);
  const merged: MinuteInterval[] = [];

  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (last && interval.start <= last.end) {
      last.end = Math.max(last.end, interval.end);
    } else {
      merged.push({ ...interval });
    }
  }

  return merged;
}

export function subtractInterval(
  windows: MinuteInterval[],
  block: MinuteInterval,
): MinuteInterval[] {
  const result: MinuteInterval[] = [];

  for (const window of windows) {
    if (block.end <= window.start || block.start >= window.end) {
      result.push(window);
      continue;
    }

    if (block.start > window.start) {
      result.push({ start: window.start, end: Math.min(block.start, window.end) });
    }

    if (block.end < window.end) {
      result.push({ start: Math.max(block.end, window.start), end: window.end });
    }
  }

  return mergeIntervals(result);
}

export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}
