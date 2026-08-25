import { requireStaff } from "@/server/auth/requireStaff";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const staff = await requireStaff();

  return (
    <main className="px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Dashboard
      </h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-600">
        Staff authentication is active for this clinic. Catalog, scheduling, and
        booking will be added in later phases.
      </p>
      <dl className="mt-8 grid max-w-lg gap-3 text-sm">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <dt className="text-zinc-500">Organization</dt>
          <dd className="mt-1 font-mono text-zinc-900">{staff.organizationId}</dd>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <dt className="text-zinc-500">Role</dt>
          <dd className="mt-1 capitalize text-zinc-900">{staff.role}</dd>
        </div>
      </dl>
    </main>
  );
}
