"use server";

import { loginWithPassword } from "@/server/auth/login";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = await loginWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/admin");
}
