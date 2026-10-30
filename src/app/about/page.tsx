import type { Metadata } from "next";
import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
export const metadata: Metadata = { title: "About AIToolss", description: "Learn about the AIToolss tool discovery directory." };
export default function AboutPage() {
 return <PublicSiteChrome><main className="info-page"><article className="info-article">
  <CmsPageContent slug="about" fallbackTitle="Your Entire AI Universe." fallbackIntro="AIToolss is a directory of browser-friendly tools and practical utilities for writing, images, productivity, coding, marketing, education, business and career tasks.">
   <div className="cms-fallback-body"><h2>Our purpose</h2><p>We bring useful digital helpers together so people can find a practical tool for the task in front of them.</p><h2>How the directory works</h2><p>Browse categories, read each tool description and open its page to see how it works. Some tools run locally in your browser; AI-powered tools use a configured model provider.</p><h2>Our approach</h2><p>We aim to describe capabilities honestly and avoid invented reviews, rankings or guarantees. Availability and features may change.</p><p><Link href="/#search" className="font-semibold text-violet-700 underline">Discover tools</Link></p></div>
  </CmsPageContent>
 </article></main></PublicSiteChrome>;
}
