import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div id="main-content" tabIndex={-1} className="flex min-h-full min-w-0 flex-1 flex-col">
      {children}
    </div>
  );
}
