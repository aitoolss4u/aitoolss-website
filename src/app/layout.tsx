import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";
import { getSiteMetadata } from "@/lib/content-pages";
import "./globals.css";

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
  icons: { icon: [{ url: "/favicon.png", type: "image/png", sizes: "48x48" }], apple: [{ url: "/brand/aitoolss-logo.png", sizes: "180x180", type: "image/png" }] },
  robots: { index: true, follow: true },
};

export async function generateMetadata(): Promise<Metadata> { return getSiteMetadata(fallbackMetadata); }

export const viewport: Viewport = {
  themeColor: "#faf9ff",
  colorScheme: "light",
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
