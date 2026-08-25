const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

function partsInTimeZone(instant: Date, timeZone: string) {
  const map: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of getFormatter(timeZone).formatToParts(instant)) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  const hourRaw = Number(map.hour);
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: hourRaw === 24 ? 0 : hourRaw,
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: map.weekday,
  };
}

/** Local clock minus UTC, in milliseconds, at this instant. */
function offsetMs(instant: Date, timeZone: string): number {
  const parts = partsInTimeZone(instant, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - instant.getTime();
}

export function zonedLocalToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
): Date {
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const first = new Date(asUtc - offsetMs(new Date(asUtc), timeZone));
  return new Date(asUtc - offsetMs(first, timeZone));
}

const WEEKDAY_TO_MONDAY_0: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Weekday in the org timezone. 0 = Monday … 6 = Sunday. */
export function weekdayMonday0(
  isoDate: string,
  timeZone: string,
): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  const noon = zonedLocalToUtc(timeZone, year, month, day, 12, 0, 0);
  const weekday = partsInTimeZone(noon, timeZone).weekday ?? "";
  const index = WEEKDAY_TO_MONDAY_0[weekday];
  if (index === undefined) {
    throw new Error(`Could not resolve weekday for ${isoDate} in ${timeZone}`);
  }
  return index;
}
