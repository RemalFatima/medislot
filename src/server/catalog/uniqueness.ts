export function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export function labelsMatch(left: string, right: string): boolean {
  return normalizeLabel(left) === normalizeLabel(right);
}

export function doctorIdentityKey(
  fullName: string,
  profession: string,
  specialization: string | null,
): string {
  return [
    normalizeLabel(fullName),
    normalizeLabel(profession),
    normalizeLabel(specialization ?? ""),
  ].join("\0");
}

export const SERVICE_NAME_CONFLICT =
  "A service with this name already exists. Open the existing one, or choose a different name if duration or price is different.";

export const DEPARTMENT_NAME_CONFLICT =
  "A department with this name already exists.";

export const DOCTOR_IDENTITY_CONFLICT =
  "A doctor with this name, profession, and specialization already exists. Two people may share a name if profession or specialization is different.";
