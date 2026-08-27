import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value));

const catalogName = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s+/g, " "))
  .pipe(z.string().min(1).max(120));

const doctorName = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s+/g, " "))
  .pipe(z.string().min(1).max(160));

export const departmentInputSchema = z.object({
  name: catalogName,
  description: optionalText.pipe(z.string().max(2000).nullable()),
  sort_order: z.coerce.number().int().min(0).max(9999),
  is_active: z.boolean(),
});

export const serviceInputSchema = z.object({
  name: catalogName,
  description: optionalText.pipe(z.string().max(2000).nullable()),
  duration_minutes: z.coerce.number().int().min(1).max(480),
  price: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    return value;
  }, z.coerce.number().min(0).nullable()),
  is_active: z.boolean(),
});

export const doctorInputSchema = z.object({
  full_name: doctorName,
  profession: catalogName,
  specialization: optionalText.pipe(z.string().max(160).nullable()),
  qualifications: optionalText.pipe(z.string().max(500).nullable()),
  bio: optionalText.pipe(z.string().max(4000).nullable()),
  photo_url: optionalText.pipe(z.string().max(500).nullable()),
  experience_years: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    return value;
  }, z.coerce.number().int().min(0).max(80).nullable()),
  consultation_fee: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    return value;
  }, z.coerce.number().min(0).nullable()),
  buffer_minutes: z.coerce.number().int().min(0).max(180),
  is_active: z.boolean(),
  department_ids: z.array(z.uuid()),
  service_ids: z.array(z.uuid()),
});

export type DepartmentInput = z.infer<typeof departmentInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type DoctorInput = z.infer<typeof doctorInputSchema>;
