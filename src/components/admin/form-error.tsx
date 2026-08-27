import { humanErrorMessage } from "@/lib/human-error";

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className="rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger"
      role="alert"
    >
      {humanErrorMessage(message)}
    </p>
  );
}
