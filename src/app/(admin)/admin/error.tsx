"use client";

import Link from "next/link";
import { ErrorState, RetryButton } from "@/components/ui/error-state";
import { buttonClass } from "@/components/ui/button";
import { humanErrorMessage } from "@/lib/human-error";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="This screen could not be loaded"
      description={humanErrorMessage(error)}
      action={
        <>
          <RetryButton onClick={reset} />
          <Link
            href="/admin"
            className={buttonClass({ variant: "secondary", className: "w-full sm:w-auto" })}
          >
            Back to dashboard
          </Link>
        </>
      }
    />
  );
}
