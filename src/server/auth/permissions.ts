import type { MemberRole } from "@/types/database";

export function canManageCatalog(role: MemberRole): boolean {
  return role === "owner" || role === "admin";
}
