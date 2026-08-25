import type { MemberRole } from "@/types/database";

export type StaffContext = {
  userId: string;
  email: string | undefined;
  organizationId: string;
  role: MemberRole;
};
