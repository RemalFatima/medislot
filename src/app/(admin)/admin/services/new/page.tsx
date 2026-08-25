import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { ServiceForm } from "../service-form";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);

  return (
    <main className="px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-950">
        New service
      </h1>
      {canManage ? (
        <ServiceForm readOnly={false} />
      ) : (
        <p className="text-sm text-zinc-600">
          Only owners and admins can add services.
        </p>
      )}
    </main>
  );
}
