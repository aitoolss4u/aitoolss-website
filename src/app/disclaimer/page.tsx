import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
import LegalPageLinks from "@/components/legal-page-links";

const fallbackMetadata: Metadata = {
  title: "Disclaimer",
  description: "Important AIToolss information about AI-generated content, online tool accuracy, local processing, third-party services and professional advice.",
  alternates: { canonical: "/disclaimer" },
};
export async function generateMetadata(): Promise<Metadata> { return getCmsMetadata("disclaimer", fallbackMetadata); }

export default function DisclaimerPage() {
  return <PublicSiteChrome><main className="info-page"><article className="info-article">
    <CmsPageContent slug="disclaimer" fallbackTitle="Disclaimer" fallbackIntro="Please read these important limitations before relying on information, listings or results provided by AIToolss. Last updated: November 6, 2026." preserveChildren>
      <div className="cms-fallback-body">
        <h2>1. General information only</h2>
        <p>AIToolss is a tool discovery directory and a collection of practical online utilities. Website descriptions, articles, examples and tool outputs are provided for general informational and productivity purposes. They are not a promise of a particular result and should not be treated as professional advice.</p>
        <h2>2. No professional advice</h2>
        <p>Nothing on this website creates a professional-client relationship or replaces advice from a qualified professional. Do not rely solely on AIToolss for legal, medical, mental-health, financial, investment, tax, cybersecurity, safety or other high-impact decisions. Consult a suitably qualified professional who can consider your circumstances.</p>
        <h2>3. AI-generated and automated output</h2>
        <p>AI-assisted or automated outputs can contain factual errors, omissions, bias, outdated information or fabricated references. Verify important claims, sources, calculations, code, translations and recommendations independently. You are responsible for reviewing content before publishing or using it.</p>
        <h2>4. Tool-specific limitations</h2>
        <p>Different tools use different methods and should not be assumed to provide expert-grade or comprehensive analysis. For example:</p>
        <ul><li>The image/video inspection utility performs local file or frame inspection; it does not establish whether media was created by AI or prove authenticity.</li><li>The background-removal utility estimates a background colour from image edges and removes connected, similar-coloured areas in the browser. It works best on simple, evenly coloured backgrounds; it is not an AI subject-segmentation model and may leave artefacts around hair, transparent objects or complex edges.</li><li>The AI Humanizer applies local wording substitutions and sentence-level rules. It does not use a trained AI model, search plagiarism databases or guarantee that content is original or will pass an AI detector.</li><li>The plagiarism checker compares text against source material pasted by the visitor. It does not search the open web, academic databases or subscription plagiarism indexes.</li><li>Dictionary definitions depend on an external public dictionary service and may be unavailable, incomplete or rate-limited.</li></ul>
        <p>Read the instructions on each <Link href="/categories" className="font-semibold text-violet-700 underline">tool category</Link> and individual tool page to understand its actual method, supported inputs and limitations.</p>
        <h2>5. Third-party services and links</h2>
        <p>AIToolss may list or link to websites, software, APIs and services operated by other organizations. We do not control their content, pricing, availability, security, privacy practices or results. A listing, link or description does not by itself mean we have tested, certified or endorsed the provider. Review the provider’s own terms and privacy policy before use.</p>
        <h2>6. Availability and technical performance</h2>
        <p>Results may depend on your device, browser, connection, file quality, external APIs, provider limits and service configuration. Features may change or become temporarily unavailable. We do not guarantee uninterrupted access, compatibility or error-free operation.</p>
        <h2>7. User responsibility and rights</h2>
        <p>You are responsible for the material you submit and for ensuring that you have the necessary rights, consent and legal basis to process it. Do not upload content that infringes copyright, violates privacy or contains confidential information you are not authorized to share. Review our <Link href="/terms" className="font-semibold text-violet-700 underline">Terms &amp; Conditions</Link> and <Link href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</Link>.</p>
        <h2>8. No guarantees or endorsements</h2>
        <p>We make no guarantee that a tool, directory listing, recommendation or output will meet a particular requirement. References to third-party products or brands are for identification and discovery only; their owners retain all rights in their names and marks.</p>
        <h2>9. Contact and related policies</h2>
        <p>If you notice an inaccurate description or a technical issue, use the <Link href="/contact-us" className="font-semibold text-violet-700 underline">Contact Us page</Link>. For information about browser storage and choices, see <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent Preferences</Link>. Learn more about the website on <Link href="/about" className="font-semibold text-violet-700 underline">About AIToolss</Link>.</p>
      </div>
    </CmsPageContent>
    <LegalPageLinks />
  </article></main></PublicSiteChrome>;
}
