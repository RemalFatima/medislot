export class SlotUnavailableError extends Error {
  constructor(message = "That time is no longer available. Pick another slot.") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}
