import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
const fallbackMetadata: Metadata = { title: "Cookie Policy & Consent", description: "Understand essential storage and manage optional analytics preferences on AIToolss." };
export async function generateMetadata(): Promise<Metadata> { return getCmsMetadata("cookie-consent",fallbackMetadata); }
export default function CookieConsentLayout({ children }: { children: React.ReactNode }) { return children; }
