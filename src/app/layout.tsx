import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";
import SiteThemeProvider from "@/components/site-theme-provider";
import ConsentManager from "@/components/consent-manager";

const fallbackMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "AIToolss — Discover Your Next AI Tool",
    template: "%s | AIToolss",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "AIToolss — Discover Your Next AI Tool",
    description: "One simple place to discover useful AI tools.",
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIToolss — Discover AI Tools That Help You Do More",
    description: siteConfig.description,
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=4", type: "image/png", sizes: "128x128" },
      { url: "/favicon.svg?v=4", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: ["/favicon.png?v=4"],
    apple: [{ url: "/favicon.png?v=4", sizes: "128x128", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export const metadata: Metadata = fallbackMetadata;

export const viewport: Viewport = {
  themeColor: "#faf9ff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <body><SiteThemeProvider>{children}<ConsentManager /></SiteThemeProvider></body>
    </html>
  );
}
