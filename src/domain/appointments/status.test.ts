import { describe, expect, it } from "vitest";
import { allowedStatusTransitions, canTransitionStatus } from "./status";

describe("appointment status transitions", () => {
  it("lets staff complete or cancel a confirmed visit", () => {
    expect(allowedStatusTransitions("confirmed")).toEqual([
      "completed",
      "cancelled",
      "no_show",
    ]);
    expect(canTransitionStatus("confirmed", "completed")).toBe(true);
  });

  it("does not reopen a cancelled visit", () => {
    expect(allowedStatusTransitions("cancelled")).toEqual([]);
    expect(canTransitionStatus("cancelled", "confirmed")).toBe(false);
  });
});
