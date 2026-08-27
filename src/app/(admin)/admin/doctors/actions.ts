"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { createDoctor, updateDoctor } from "@/server/catalog/doctors";
import { humanErrorMessage } from "@/lib/human-error";
import {
  type CatalogFormState,
  readCheckbox,
  readString,
  readStringArray,
} from "../form-utils";

function readDoctorInput(formData: FormData) {
  return {
    full_name: readString(formData, "full_name"),
    profession: readString(formData, "profession"),
    specialization: readString(formData, "specialization"),
    qualifications: readString(formData, "qualifications"),
    bio: readString(formData, "bio"),
    photo_url: readString(formData, "photo_url"),
    experience_years: readString(formData, "experience_years"),
    consultation_fee: readString(formData, "consultation_fee"),
    buffer_minutes: readString(formData, "buffer_minutes") || "0",
    is_active: readCheckbox(formData, "is_active"),
    department_ids: readStringArray(formData, "department_id"),
    service_ids: readStringArray(formData, "service_id"),
  };
}

function revalidateCatalog() {
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  revalidatePath("/departments");
  revalidatePath("/");
}

export async function createDoctorAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change the catalog." };
  }

  try {
    await createDoctor(readDoctorInput(formData));
  } catch (error) {
    return {
      error: humanErrorMessage(error, "Could not create doctor."),
    };
  }

  revalidateCatalog();
  redirect("/admin/doctors");
}

export async function updateDoctorAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change the catalog." };
  }

  const id = readString(formData, "id");
  if (!id) {
    return { error: "Doctor is missing." };
  }

  try {
    await updateDoctor(id, readDoctorInput(formData));
  } catch (error) {
    return {
      error: humanErrorMessage(error, "Could not update doctor."),
    };
  }

  revalidateCatalog();
  redirect("/admin/doctors");
}
