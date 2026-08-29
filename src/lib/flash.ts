import { redirect } from "next/navigation";

export const FLASH_MESSAGES = {
  created: "Created successfully.",
  updated: "Updated successfully.",
  saved: "Saved successfully.",
  added: "Added successfully.",
  deleted: "Deleted successfully.",
} as const;

export type FlashKey = keyof typeof FLASH_MESSAGES;

export function flashPath(path: string, flash: FlashKey): string {
  return `${path}${path.includes("?") ? "&" : "?"}flash=${flash}`;
}

export function redirectWithFlash(path: string, flash: FlashKey): never {
  redirect(flashPath(path, flash));
}
