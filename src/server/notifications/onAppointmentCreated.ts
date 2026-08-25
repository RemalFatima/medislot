export async function onAppointmentCreated(event: {
  appointmentId: string;
  organizationId: string;
}): Promise<void> {
  void event;
  // V1: noop. WhatsApp/SMS adapters will implement this port later.
}
