"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import {
  createDepartment,
  updateDepartment,
} from "@/server/catalog/departments";
import { humanErrorMessage } from "@/lib/human-error";
import {
  type CatalogFormState,
  readCheckbox,
  readString,
} from "../form-utils";

function readDepartmentInput(formData: FormData) {
  return {
    name: readString(formData, "name"),
    description: readString(formData, "description"),
    sort_order: readString(formData, "sort_order") || "0",
    is_active: readCheckbox(formData, "is_active"),
  };
}

function revalidateCatalog() {
  revalidatePath("/admin/departments");
  revalidatePath("/departments");
  revalidatePath("/doctors");
  revalidatePath("/");
}

export async function createDepartmentAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change the catalog." };
  }

  try {
    await createDepartment(readDepartmentInput(formData));
  } catch (error) {
    return {
      error: humanErrorMessage(error, "Could not create department."),
    };
  }

  revalidateCatalog();
  redirect("/admin/departments");
}

export async function updateDepartmentAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change the catalog." };
  }

  const id = readString(formData, "id");
  if (!id) {
    return { error: "Department is missing." };
  }

  try {
    await updateDepartment(id, readDepartmentInput(formData));
  } catch (error) {
    return {
      error: humanErrorMessage(error, "Could not update department."),
    };
  }

  revalidateCatalog();
  redirect("/admin/departments");
}
