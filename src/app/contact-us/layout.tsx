import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
const fallbackMetadata: Metadata = { title: "Contact AIToolss", description: "Contact the AIToolss project team." };
export async function generateMetadata(): Promise<Metadata> { return getCmsMetadata("contact-us",fallbackMetadata); }
export default function ContactLayout({ children }: { children: React.ReactNode }) { return children; }
