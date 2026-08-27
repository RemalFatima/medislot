import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";
import { buttonClass } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <ErrorState
      title="Page not found"
      description="That screen does not exist or is no longer available."
      action={
        <Link href="/admin" className={buttonClass({ className: "w-full sm:w-auto" })}>
          Back to dashboard
        </Link>
      }
    />
  );
}
