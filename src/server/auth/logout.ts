import { redirect } from "next/navigation";
import { createClient } from "@/server/supabase/server";

export async function logoutStaff(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
