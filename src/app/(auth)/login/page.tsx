import { getStaffContext } from "@/server/auth/getStaffContext";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const staff = await getStaffContext();

  if (staff) {
    redirect("/admin");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Staff sign in
        </h1>
        <p className="mt-2 mb-6 text-sm text-muted">
          Sign in with your clinic account. Patient registration is not available.
        </p>
        <LoginForm />
      </Card>
    </main>
  );
}
