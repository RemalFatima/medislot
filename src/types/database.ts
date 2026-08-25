export type MemberRole = "owner" | "admin" | "receptionist" | "doctor";
export type OrganizationType = "hospital" | "clinic";
export type ExceptionType = "holiday" | "leave" | "special_hours" | "unavailable";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type AppointmentSource = "public" | "admin";
export type NotificationChannel = "whatsapp" | "sms" | "email";
export type NotificationType = "confirmation" | "reminder" | "cancellation";
export type NotificationStatus = "queued" | "sent" | "failed";

export const ADMIN_CONSOLE_ROLES: readonly MemberRole[] = [
  "owner",
  "admin",
  "receptionist",
];

type Row = Record<string, unknown>;

type PublicTable<TRow extends Row> = {
  Row: TRow;
  Insert: { [K in keyof TRow]?: TRow[K] };
  Update: { [K in keyof TRow]?: TRow[K] };
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: PublicTable<{
        id: string;
        name: string;
        slug: string;
        type: OrganizationType;
        logo_url: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
        timezone: string;
        locale: string;
        branding: Record<string, unknown>;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      profiles: PublicTable<{
        id: string;
        full_name: string;
        phone: string | null;
        avatar_url: string | null;
        created_at: string;
        updated_at: string;
      }>;
      organization_members: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string;
        role: MemberRole;
        is_active: boolean;
        created_at: string;
      }>;
      departments: PublicTable<{
        id: string;
        organization_id: string;
        name: string;
        slug: string;
        description: string | null;
        sort_order: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      doctors: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string | null;
        full_name: string;
        slug: string;
        photo_url: string | null;
        profession: string;
        specialization: string | null;
        qualifications: string | null;
        experience_years: number | null;
        consultation_fee: number | null;
        bio: string | null;
        buffer_minutes: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      doctor_departments: PublicTable<{
        organization_id: string;
        doctor_id: string;
        department_id: string;
      }>;
      services: PublicTable<{
        id: string;
        organization_id: string;
        name: string;
        slug: string;
        description: string | null;
        duration_minutes: number;
        price: number | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      doctor_services: PublicTable<{
        organization_id: string;
        doctor_id: string;
        service_id: string;
      }>;
      doctor_availability: PublicTable<{
        id: string;
        organization_id: string;
        doctor_id: string;
        weekday: number;
        start_time: string;
        end_time: string;
        is_active: boolean;
      }>;
      availability_exceptions: PublicTable<{
        id: string;
        organization_id: string;
        doctor_id: string | null;
        date: string;
        type: ExceptionType;
        start_time: string | null;
        end_time: string | null;
        reason: string | null;
        created_at: string;
      }>;
      appointments: PublicTable<{
        id: string;
        organization_id: string;
        doctor_id: string;
        service_id: string;
        patient_name: string;
        patient_phone: string;
        patient_email: string | null;
        start_at: string;
        end_at: string;
        buffer_minutes: number;
        status: AppointmentStatus;
        notes: string | null;
        confirmation_token: string;
        source: AppointmentSource;
        created_at: string;
        updated_at: string;
      }>;
      notification_logs: PublicTable<{
        id: string;
        organization_id: string;
        appointment_id: string;
        channel: NotificationChannel;
        type: NotificationType;
        status: NotificationStatus;
        provider_message_id: string | null;
        sent_at: string | null;
        error_message: string | null;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      organization_type: OrganizationType;
      member_role: MemberRole;
      exception_type: ExceptionType;
      appointment_status: AppointmentStatus;
      appointment_source: AppointmentSource;
      notification_channel: NotificationChannel;
      notification_type: NotificationType;
      notification_status: NotificationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
