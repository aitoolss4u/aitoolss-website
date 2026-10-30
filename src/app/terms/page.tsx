import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
const fallbackMetadata: Metadata = { title: "Terms & Conditions", description: "Terms for using AIToolss and its browser-based utilities." };
export async function generateMetadata(): Promise<Metadata> { return getCmsMetadata("terms", fallbackMetadata); }
export default function TermsPage() {
 return <PublicSiteChrome><main className="info-page"><article className="info-article">
  <CmsPageContent slug="terms" fallbackTitle="Terms & Conditions" fallbackIntro="Please use AIToolss lawfully and review tool outputs before relying on them. Last updated: October 30, 2026.">
   <div className="cms-fallback-body">
    <h2>Using the website</h2><p>AIToolss provides a tool directory and digital utilities for general informational and productivity purposes. You agree not to misuse the service, interfere with its operation, attempt unauthorized access or use the site in violation of applicable law.</p>
    <h2>Tool output and responsibility</h2><p>Tools are provided as available. Outputs may be incomplete, inaccurate or unsuitable for a particular purpose. You are responsible for reviewing results before relying on them.</p>
    <h2>User content</h2><p>You remain responsible for having the rights and permissions needed to submit, process or publish content. Do not submit unlawful, infringing or confidential material you are not authorized to share.</p>
    <h2>Third-party services</h2><p>Listings and links may lead to services operated by other organizations. Their availability, prices, terms and privacy practices are controlled by those providers, not AIToolss.</p>
    <h2>Availability and changes</h2><p>Features may change, be suspended or be removed. We do not guarantee uninterrupted availability or a particular result.</p>
    <h2>Contact</h2><p>Questions about these terms can be sent to aitoolss4u@gmail.com. This information is general and is not legal advice.</p>
   </div>
  </CmsPageContent>
 </article></main></PublicSiteChrome>;
}
