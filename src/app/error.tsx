"use client";

import Link from "next/link";
import { ErrorState, RetryButton } from "@/components/ui/error-state";
import { buttonClass } from "@/components/ui/button";
import { humanErrorMessage } from "@/lib/human-error";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center">
      <ErrorState
        title="Something went wrong"
        description={humanErrorMessage(error)}
        action={
          <>
            <RetryButton onClick={reset} />
            <Link href="/" className={buttonClass({ variant: "secondary", className: "w-full sm:w-auto" })}>
              Back to home
            </Link>
          </>
        }
      />
    </main>
  );
}
