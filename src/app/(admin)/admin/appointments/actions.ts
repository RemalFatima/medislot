"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/server/auth/requireStaff";
import { bookAppointment } from "@/server/appointments/book";
import { SlotUnavailableError, DuplicateBookingError } from "@/server/appointments/errors";
import { updateAppointmentStatus } from "@/server/appointments/updateStatus";
import { humanErrorMessage, isZodError } from "@/lib/human-error";
import { redirectWithFlash } from "@/lib/flash";
import type { CatalogFormState } from "../form-utils";
import { readString } from "../form-utils";

export async function updateAppointmentStatusAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  await requireStaff();

  try {
    await updateAppointmentStatus({
      id: readString(formData, "id"),
      status: readString(formData, "status"),
    });
  } catch (error) {
    if (isZodError(error)) {
      return { error: error.issues[0]?.message ?? "Could not update status." };
    }
    return {
      error: error instanceof Error ? error.message : "Could not update status.",
    };
  }

  revalidatePath("/admin/appointments");
  const query = readString(formData, "return_query");
  const safeQuery = query
    .split("&")
    .filter((part) => /^(date|doctor|status)=/.test(part))
    .join("&");
  redirectWithFlash(
    safeQuery ? `/admin/appointments?${safeQuery}` : "/admin/appointments",
    "updated",
  );
}

export async function createWalkInAction(
  _previous: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  await requireStaff();

  try {
    await bookAppointment({
      doctor_id: readString(formData, "doctor_id"),
      service_id: readString(formData, "service_id"),
      start_at: readString(formData, "start_at"),
      patient_name: readString(formData, "patient_name"),
      patient_phone: readString(formData, "patient_phone"),
      patient_email: readString(formData, "patient_email"),
      source: "admin",
      notes: readString(formData, "notes"),
    });
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return { error: error.message };
    }
    if (error instanceof DuplicateBookingError) {
      return { error: error.message };
    }
    if (isZodError(error)) {
      return {
        error: error.issues[0]?.message ?? "Check the walk-in details.",
      };
    }
    return {
      error: humanErrorMessage(error, "Could not create the visit."),
    };
  }

  revalidatePath("/admin/appointments");
  redirectWithFlash("/admin/appointments", "created");
}
