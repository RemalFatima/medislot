import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value));

function isIanaTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export const organizationSettingsSchema = z.object({
  name: z.string().trim().min(1).max(160),
  type: z.enum(["hospital", "clinic"]),
  timezone: z
    .string()
    .trim()
    .min(1)
    .refine(isIanaTimeZone, "Enter a valid IANA timezone"),
  locale: z.string().trim().min(2).max(16),
  phone: optionalText.pipe(z.string().max(40).nullable()),
  email: z.preprocess((value) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }
    return value.trim();
  }, z.email().nullable()),
  address: optionalText.pipe(z.string().max(500).nullable()),
  city: optionalText.pipe(z.string().max(120).nullable()),
  logo_url: optionalText.pipe(z.string().max(500).nullable()),
  tagline: optionalText.pipe(z.string().max(200).nullable()),
  description: optionalText.pipe(z.string().max(2000).nullable()),
  is_active: z.boolean(),
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
