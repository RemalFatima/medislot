"use server";

import { revalidatePath } from "next/cache";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { getDoctorById } from "@/server/catalog/doctors";
import { replaceDoctorAvailability } from "@/server/scheduling/availability";
import { errorMessage } from "@/server/scheduling/errors";
import {
  createException,
  deleteException,
} from "@/server/scheduling/exceptions";
import { redirectWithFlash } from "@/lib/flash";
import type { CatalogFormState } from "./form-utils";
import { readString } from "./form-utils";

function revalidateDoctor(doctorId: string, slug?: string) {
  revalidatePath(`/admin/doctors/${doctorId}`);
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  if (slug) {
    revalidatePath(`/doctors/${slug}`);
  }
}

function revalidateHolidays() {
  revalidatePath("/admin/holidays");
  revalidatePath("/doctors");
}

export async function saveDoctorAvailabilityAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change schedules." };
  }

  const doctorId = readString(formData, "doctor_id");
  if (!doctorId) {
    return { error: "Doctor is missing." };
  }

  const weekdays = formData.getAll("weekday");
  const starts = formData.getAll("start_time");
  const ends = formData.getAll("end_time");
  const windows = weekdays.map((weekday, index) => ({
    weekday,
    start_time: starts[index],
    end_time: ends[index],
  }));

  try {
    await replaceDoctorAvailability(doctorId, windows);
  } catch (error) {
    return {
      error: errorMessage(error, "Could not save weekly hours."),
    };
  }

  const doctor = await getDoctorById(doctorId);
  revalidateDoctor(doctorId, doctor?.slug);
  redirectWithFlash(`/admin/doctors/${doctorId}`, "saved");
}

export async function createExceptionAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change holidays." };
  }

  try {
    await createException({
      doctor_id: readString(formData, "doctor_id"),
      date: readString(formData, "date"),
      type: readString(formData, "type"),
      start_time: readString(formData, "start_time"),
      end_time: readString(formData, "end_time"),
      reason: readString(formData, "reason"),
    });
  } catch (error) {
    return {
      error: errorMessage(error, "Could not save the exception."),
    };
  }

  revalidateHolidays();
  redirectWithFlash("/admin/holidays", "added");
}

export async function deleteExceptionAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const staff = await requireStaff();
  if (!canManageCatalog(staff.role)) {
    return { error: "You do not have permission to change holidays." };
  }

  const id = readString(formData, "id");
  if (!id) {
    return { error: "Exception is missing." };
  }

  try {
    await deleteException(id);
  } catch (error) {
    return {
      error: errorMessage(error, "Could not delete the exception."),
    };
  }

  revalidateHolidays();
  redirectWithFlash("/admin/holidays", "deleted");
}
