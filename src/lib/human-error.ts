const UNSAFE =
  /supabase|postgres|pgrst|permission denied|jwt|stack trace|organization_id|column |relation |rpc |sqlstate|violates|duplicate key|code:|hint:/i;

export function humanErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";
  const message = raw.trim();

  if (!message || message.length > 220 || UNSAFE.test(message)) {
    return fallback;
  }

  return message;
}
