import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SkipLink } from "@/components/ui/skip-link";
import { getPublicOrganization } from "@/server/tenant/getPublicOrganization";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const organization = await getPublicOrganization();
  return {
    title: organization?.name ?? "MediSlot",
    description:
      organization?.branding.tagline ??
      organization?.branding.description ??
      "Hospital and clinic doctor appointment platform",
    icons: organization?.logo_url
      ? { icon: organization.logo_url }
      : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const organization = await getPublicOrganization();

  return (
    <html
      lang={organization?.locale ?? "en"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col font-sans">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
