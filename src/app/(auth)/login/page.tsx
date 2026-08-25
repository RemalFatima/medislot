import { getStaffContext } from "@/server/auth/getStaffContext";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const staff = await getStaffContext();

  if (staff) {
    redirect("/admin");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
          Staff sign in
        </h1>
        <p className="mt-2 mb-6 text-sm text-zinc-600">
          Sign in with your clinic account. Patient registration is not
          available.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
