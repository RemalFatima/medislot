"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FLASH_MESSAGES, type FlashKey } from "@/lib/flash";
import { useToast } from "@/components/ui/toast";

export function FlashToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const seen = useRef<string | null>(null);
  const flash = searchParams.get("flash");

  useEffect(() => {
    if (!flash) {
      seen.current = null;
      return;
    }
    if (seen.current === flash) {
      return;
    }

    const message = FLASH_MESSAGES[flash as FlashKey];
    if (!message) {
      return;
    }

    seen.current = flash;
    showToast(message);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("flash");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [flash, pathname, router, searchParams, showToast]);

  return null;
}
