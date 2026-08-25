import Link from "next/link";
import { canManageCatalog } from "@/server/auth/permissions";
import { requireStaff } from "@/server/auth/requireStaff";
import { listServices } from "@/server/catalog/services";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const staff = await requireStaff();
  const canManage = canManageCatalog(staff.role);
  const services = await listServices();

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Services
        </h1>
        {canManage ? (
          <Link
            href="/admin/services/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add service
          </Link>
        ) : null}
      </div>
      {services.length === 0 ? (
        <p className="text-sm text-zinc-600">No services yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                href={`/admin/services/${service.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium text-zinc-950">{service.name}</p>
                  <p className="text-xs text-zinc-500">
                    {service.duration_minutes} min
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {service.is_active ? "Active" : "Hidden"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
