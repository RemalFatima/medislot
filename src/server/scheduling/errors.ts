import { humanErrorMessage } from "@/lib/human-error";

export function errorMessage(error: unknown, fallback: string): string {
  return humanErrorMessage(error, fallback);
}
