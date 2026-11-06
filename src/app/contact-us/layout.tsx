import type { Metadata } from "next";

const fallbackMetadata: Metadata = {
  title: "Contact AIToolss | Support, Feedback & Tool Suggestions",
  description: "Contact AIToolss to report a problem, suggest a tool, share feedback, or ask about privacy and website policies.",
  alternates: { canonical: "/contact-us" },
  openGraph: {
    title: "Contact AIToolss",
    description: "Get in touch with AIToolss for support, feedback and tool suggestions.",
    url: "https://aitoolss.com/contact-us",
    type: "website",
  },
};
export const metadata = fallbackMetadata;
export default function ContactLayout({ children }: { children: React.ReactNode }) { return children; }
