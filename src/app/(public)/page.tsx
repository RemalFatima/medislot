import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          MediSlot
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Doctor appointments for your clinic
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Patients will be able to find doctors and book slots here. Hospital
          staff can sign in to manage the clinic.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Staff sign in
        </Link>
      </div>
    </main>
  );
}
