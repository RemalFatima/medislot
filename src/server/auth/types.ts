import type { StaffRole } from "@/types/database";

export type StaffContext = {
  userId: string;
  email: string | undefined;
  organizationId: string;
  role: StaffRole;
};
