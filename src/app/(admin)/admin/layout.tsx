import { Suspense } from "react";
import { requireStaff } from "@/server/auth/requireStaff";
import { AdminShell } from "@/components/admin/admin-shell";
import { FlashToast } from "@/components/ui/flash-toast";
import { ToastProvider } from "@/components/ui/toast";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const staff = await requireStaff();

  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminShell
        staffEmail={staff.email ?? null}
        staffRole={staff.role}
        logoutAction={logoutAction}
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
