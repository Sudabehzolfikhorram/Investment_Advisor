import type { Metadata } from "next";
import "vazirmatn/Vazirmatn-Variable-font-face.css";
import "./globals.css";
import { site } from "@/data/site";
import { Providers } from "@/components/providers";

export const metadata: Metadata = { title: `${site.name} | ${site.tagline}`, description: site.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
