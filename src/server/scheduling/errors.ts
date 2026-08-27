import { ZodError } from "zod";
import { humanErrorMessage } from "@/lib/human-error";

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  return humanErrorMessage(error, fallback);
}
