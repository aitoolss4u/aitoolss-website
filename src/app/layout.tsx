import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aitoolss.com"),
  title: {
    default: "AIToolss — Discover AI Tools That Help You Do More",
    template: "%s | AIToolss",
  },
  description:
    "Discover useful AI tools for writing, creativity, productivity, coding, education and more.",
  applicationName: "AIToolss",
  openGraph: {
    type: "website",
    siteName: "AIToolss",
    title: "AIToolss — Discover AI Tools That Help You Do More",
    description: "One simple place to discover useful AI tools.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B1020",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
