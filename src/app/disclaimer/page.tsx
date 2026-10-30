import type { Metadata } from "next";
import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
export const metadata: Metadata = { title: "Disclaimer | AIToolss", description: "Important information about AI-assisted output, tools and third-party services." };
export default function DisclaimerPage() {
 return <PublicSiteChrome><main className="info-page"><article className="info-article">
  <CmsPageContent slug="disclaimer" fallbackTitle="Disclaimer" fallbackIntro="Important information about AI-assisted outputs, tools and third-party services.">
   <div className="cms-fallback-body">
    <h2>General information</h2><p>AIToolss provides a directory and practical utilities for general informational and productivity purposes. Website content is not a guarantee of a particular outcome.</p>
    <h2>AI-generated output</h2><p>AI-generated content may contain errors, omissions, bias or outdated information. Review and independently verify important claims, calculations, citations and recommendations before using them.</p>
    <h2>No professional advice</h2><p>Tools and generated content are not a substitute for professional legal, financial, medical, tax, safety or other specialized advice.</p>
    <h2>Third-party tools</h2><p>Some listed products and services are owned and operated by third parties. A listing does not mean AIToolss owns, controls, verifies or endorses that service. Providers may have separate terms, privacy policies, fees and availability.</p>
    <h2>Availability and results</h2><p>Tool availability and results may depend on the browser, device, external providers, model availability and configuration. AIToolss does not guarantee uninterrupted access, accuracy or suitability.</p>
    <p>For information about data handling, review our <Link href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</Link>.</p>
   </div>
  </CmsPageContent>
 </article></main></PublicSiteChrome>;
}
