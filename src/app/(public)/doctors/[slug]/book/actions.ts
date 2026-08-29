"use server";

import { redirect } from "next/navigation";
import { bookAppointment } from "@/server/appointments/book";
import { SlotUnavailableError, DuplicateBookingError } from "@/server/appointments/errors";
import { isZodError } from "@/lib/human-error";

export type BookFormState = {
  error?: string;
};

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function bookAppointmentAction(
  _previous: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  try {
    const booked = await bookAppointment({
      doctor_id: readString(formData, "doctor_id"),
      service_id: readString(formData, "service_id"),
      start_at: readString(formData, "start_at"),
      patient_name: readString(formData, "patient_name"),
      patient_phone: readString(formData, "patient_phone"),
      patient_email: readString(formData, "patient_email"),
    });
    redirect(`/booking/${booked.confirmation_token}`);
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return { error: error.message };
    }
    if (error instanceof DuplicateBookingError) {
      return { error: error.message };
    }
    if (isZodError(error)) {
      return {
        error: error.issues[0]?.message ?? "Check the booking details.",
      };
    }
    throw error;
  }
}
