"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { updateOrganizationSettings } from "@/server/settings/organization";
import {
  type CatalogFormState,
  readCheckbox,
  readString,
} from "../form-utils";

export async function updateOrganizationSettingsAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change clinic settings." };
  }

  try {
    await updateOrganizationSettings({
      name: readString(formData, "name"),
      type: readString(formData, "type"),
      timezone: readString(formData, "timezone"),
      locale: readString(formData, "locale"),
      phone: readString(formData, "phone"),
      email: readString(formData, "email"),
      address: readString(formData, "address"),
      city: readString(formData, "city"),
      logo_url: readString(formData, "logo_url"),
      tagline: readString(formData, "tagline"),
      description: readString(formData, "description"),
      is_active: readCheckbox(formData, "is_active"),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: error.issues[0]?.message ?? "Check the clinic details.",
      };
    }
    return {
      error:
        error instanceof Error ? error.message : "Could not save settings.",
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return {};
}
