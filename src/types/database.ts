export type StaffRole = "admin" | "staff";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          timezone: string;
          locale: string;
          phone: string | null;
          address: string | null;
          logo_url: string | null;
          branding: Record<string, unknown>;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          timezone?: string;
          locale?: string;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          branding?: Record<string, unknown>;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          timezone?: string;
          locale?: string;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          branding?: Record<string, unknown>;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      staff_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: StaffRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: StaffRole;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: StaffRole;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      staff_role: StaffRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
