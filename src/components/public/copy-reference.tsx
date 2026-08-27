"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyReference({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label={copied ? "Copied confirmation code" : "Copy confirmation code"}
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied" : "Copy code"}
    </Button>
  );
}
