export class SlotUnavailableError extends Error {
  constructor(message = "That time is no longer available. Pick another slot.") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

export class DuplicateBookingError extends Error {
  constructor(
    message = "This visit is already booked for that phone number. Open the existing appointment instead of creating another.",
  ) {
    super(message);
    this.name = "DuplicateBookingError";
  }
}

export function normalizePhone(value: string): string {
  return value.trim().replace(/[^\d+]/g, "");
}
