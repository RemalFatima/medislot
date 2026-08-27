"use client";

import Link from "next/link";
import { ErrorState, RetryButton, retryHandler } from "@/components/ui/error-state";
import { buttonClass } from "@/components/ui/button";
import { humanErrorMessage } from "@/lib/human-error";

export default function RootError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center">
      <ErrorState
        title="Something went wrong"
        description={humanErrorMessage(error)}
        action={
          <>
            <RetryButton onClick={retryHandler(retry, reset)} />
            <Link href="/" className={buttonClass({ variant: "secondary", className: "w-full sm:w-auto" })}>
              Back to home
            </Link>
          </>
        }
      />
    </main>
  );
}
