"use server";

import { revalidatePath } from "next/cache";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { createService, updateService } from "@/server/catalog/services";
import { humanErrorMessage } from "@/lib/human-error";
import { redirectWithFlash } from "@/lib/flash";
import {
  type CatalogFormState,
  readCheckbox,
  readString,
} from "../form-utils";

function readServiceInput(formData: FormData) {
  return {
    name: readString(formData, "name"),
    description: readString(formData, "description"),
    duration_minutes: readString(formData, "duration_minutes"),
    price: readString(formData, "price"),
    is_active: readCheckbox(formData, "is_active"),
  };
}

function revalidateCatalog() {
  revalidatePath("/admin/services");
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  revalidatePath("/");
}

export async function createServiceAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change the catalog." };
  }

  try {
    await createService(readServiceInput(formData));
  } catch (error) {
    return {
      error: humanErrorMessage(error, "Could not create service."),
    };
  }

  revalidateCatalog();
  redirectWithFlash("/admin/services", "created");
}

export async function updateServiceAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change the catalog." };
  }

  const id = readString(formData, "id");
  if (!id) {
    return { error: "Service is missing." };
  }

  try {
    await updateService(id, readServiceInput(formData));
  } catch (error) {
    return {
      error: humanErrorMessage(error, "Could not update service."),
    };
  }

  revalidateCatalog();
  redirectWithFlash("/admin/services", "updated");
}
