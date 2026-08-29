import { describe, expect, it } from "vitest";
import {
  normalizeCatalogKey,
  serviceIdsForDepartments,
} from "./department-services";

describe("department services catalog", () => {
  it("normalizes curly apostrophes", () => {
    expect(normalizeCatalogKey("Women\u2019s Health Checkup")).toBe(
      "womens health checkup",
    );
    expect(normalizeCatalogKey("Women's Health Checkup")).toBe(
      "womens health checkup",
    );
  });

  it("maps gynecology to its services", () => {
    const ids = serviceIdsForDepartments(
      ["dept-1"],
      [{ id: "dept-1", name: "Gynecology", slug: "gynecology" }],
      [
        { id: "s-1", name: "Gynecology Consultation" },
        { id: "s-2", name: "Cardiology Consultation" },
        { id: "s-3", name: "Prenatal Checkup" },
      ],
    );
    expect([...ids].sort()).toEqual(["s-1", "s-3"]);
  });

  it("matches emergency-medicine slug", () => {
    const ids = serviceIdsForDepartments(
      ["dept-1"],
      [{ id: "dept-1", name: "Emergency", slug: "emergency-medicine" }],
      [{ id: "s-1", name: "Accident & Injury Care" }],
    );
    expect([...ids]).toEqual(["s-1"]);
  });
});
