import { z } from "zod";

export const bookAppointmentSchema = z.object({
  doctor_id: z.uuid(),
  service_id: z.uuid(),
  start_at: z.iso.datetime({ offset: true }),
  patient_name: z.string().trim().min(2).max(160),
  patient_phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[+0-9][0-9\s-]*$/, "Enter a valid phone number"),
  patient_email: z.preprocess((value) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }
    return value.trim();
  }, z.email().nullable()),
  source: z.enum(["public", "admin"]).default("public"),
  notes: z.preprocess((value) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }
    return value.trim();
  }, z.string().max(2000).nullable()),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
