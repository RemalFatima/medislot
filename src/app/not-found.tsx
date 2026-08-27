import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <ErrorState
        title="Page not found"
        description="That page does not exist or is no longer available."
        action={
          <>
            <Link href="/" className={buttonClass({ className: "w-full sm:w-auto" })}>
              Back to home
            </Link>
            <Link
              href="/doctors"
              className={buttonClass({ variant: "secondary", className: "w-full sm:w-auto" })}
            >
              Browse doctors
            </Link>
          </>
        }
      />
    </main>
  );
}
