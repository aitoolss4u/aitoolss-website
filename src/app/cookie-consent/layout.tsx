import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy & Consent Preferences",
  description: "Understand AIToolss browser storage, essential cookies, optional analytics preferences and how to manage your consent choices.",
  alternates: { canonical: "/cookie-consent" },
  openGraph: {
    title: "Cookie Policy & Consent Preferences | AIToolss",
    description: "Review browser storage and manage optional analytics preferences on AIToolss.",
    url: "https://aitoolss.com/cookie-consent",
    type: "website",
  },
};
export default function CookieConsentLayout({ children }: { children: React.ReactNode }) { return children; }
