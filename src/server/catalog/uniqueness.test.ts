import { describe, expect, it } from "vitest";
import { doctorInputSchema, serviceInputSchema } from "./schemas";
import {
  doctorIdentityKey,
  labelsMatch,
  normalizeLabel,
} from "./uniqueness";
import { normalizePhone } from "@/server/appointments/errors";

describe("catalog uniqueness helpers", () => {
  it("treats names as equal ignoring case and extra spaces", () => {
    expect(normalizeLabel("  Physio   Consultation ")).toBe(
      "physio consultation",
    );
    expect(labelsMatch("Physiotherapy Consultation", "physiotherapy  consultation")).toBe(
      true,
    );
  });

  it("treats doctors with the same name as different if profession differs", () => {
    const gp = doctorIdentityKey("Dr Ahmed", "General Practitioner", null);
    const cardio = doctorIdentityKey("Dr Ahmed", "Cardiologist", null);
    const gpAgain = doctorIdentityKey("dr  ahmed", "general practitioner", "");

    expect(gp).not.toBe(cardio);
    expect(gp).toBe(gpAgain);
  });

  it("collapses service names on parse", () => {
    const parsed = serviceInputSchema.parse({
      name: "  Follow  up  ",
      description: "",
      duration_minutes: "15",
      price: "",
      is_active: true,
    });
    expect(parsed.name).toBe("Follow up");
  });

  it("collapses doctor names on parse", () => {
    const parsed = doctorInputSchema.parse({
      full_name: "  Dr   Ahmed  ",
      profession: " GP ",
      specialization: "",
      qualifications: "",
      bio: "",
      photo_url: "",
      experience_years: "",
      consultation_fee: "",
      buffer_minutes: "0",
      is_active: true,
      department_ids: [],
      service_ids: [],
    });
    expect(parsed.full_name).toBe("Dr Ahmed");
    expect(parsed.profession).toBe("GP");
    expect(parsed.specialization).toBeNull();
  });
});

describe("booking phone normalize", () => {
  it("ignores spaces and dashes when comparing phones", () => {
    expect(normalizePhone("+92 300-123 4567")).toBe("+923001234567");
  });
});
