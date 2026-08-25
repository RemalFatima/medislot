import { redirect } from "next/navigation";
import { getStaffContext } from "./getStaffContext";
import type { StaffContext } from "./types";

export async function requireStaff(): Promise<StaffContext> {
  const staff = await getStaffContext();

  if (!staff) {
    redirect("/login");
  }

  return staff;
}
