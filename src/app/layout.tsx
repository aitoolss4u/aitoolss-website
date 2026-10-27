import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "AIToolss — Discover AI Tools That Help You Do More",
    template: "%s | AIToolss",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "AIToolss — Discover AI Tools That Help You Do More",
    description: "One simple place to discover useful AI tools.",
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIToolss — Discover AI Tools That Help You Do More",
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: siteConfig.theme.midnightNavy,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
