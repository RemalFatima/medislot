"use server";

import { logoutStaff } from "@/server/auth/logout";

export async function logoutAction() {
  await logoutStaff();
}
