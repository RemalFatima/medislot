import type { ReactNode } from "react";

export const fieldClass =
  "h-11 rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-900";

export const textareaClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-800">{label}</span>
      {children}
    </label>
  );
}
