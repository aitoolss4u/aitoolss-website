import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
import LegalPageLinks from "@/components/legal-page-links";

const fallbackMetadata: Metadata = {
  title: "Terms & Conditions",
  description: "Review the terms for accessing AIToolss, using its online tools, submitting content and following third-party service links.",
  alternates: { canonical: "/terms" },
};
export async function generateMetadata(): Promise<Metadata> { return getCmsMetadata("terms", fallbackMetadata); }

export default function TermsPage() {
  return <PublicSiteChrome><main className="info-page"><article className="info-article">
    <CmsPageContent slug="terms" fallbackTitle="Terms & Conditions" fallbackIntro="These Terms & Conditions apply when you visit or use AIToolss.com, its directory, pages and online utilities. Please read them before using the service. Last updated: November 6, 2026." preserveChildren>
      <div className="cms-fallback-body">
        <h2>1. Agreement and website operator</h2>
        <p>These terms govern your access to <Link href="/" className="font-semibold text-violet-700 underline">AIToolss.com</Link> (“AIToolss”, “we”, “us” or “our”). By browsing the website or using a tool, you agree to these terms. If you do not agree, stop using the website. For information about our purpose, see <Link href="/about" className="font-semibold text-violet-700 underline">About AIToolss</Link>.</p>
        <h2>2. What AIToolss provides</h2>
        <p>AIToolss provides a directory for discovering third-party digital tools and a selection of utilities made available through the website. Features may include browser-based processing, content helpers, directories, links and integrations. The exact functionality, data handling and limitations are described on the relevant tool page and may change over time.</p>
        <h2>3. Eligibility and acceptable use</h2>
        <p>You may use the website only in compliance with applicable laws and these terms. You agree not to:</p>
        <ul><li>Use the site to violate another person’s rights or applicable law.</li><li>Upload, submit or distribute malware, malicious code, spam or unlawful material.</li><li>Attempt unauthorized access to accounts, systems, databases or administrative areas.</li><li>Interfere with site operation, bypass reasonable usage limits or disrupt other visitors.</li><li>Scrape, copy or republish site content at scale in a way that violates rights or applicable law.</li><li>Use a tool output to make a high-impact decision without appropriate independent review.</li></ul>
        <h2>4. Accounts and administrative access</h2>
        <p>Some administrative functions are restricted to authorized users. You are responsible for keeping sign-in credentials confidential and for activity performed through your account. Notify the site operator if you suspect unauthorized access. We may suspend access where reasonably necessary to protect the website.</p>
        <h2>5. Your content and permissions</h2>
        <p>You retain rights you already hold in content you submit. You are responsible for ensuring that you own or have permission to upload, process, transform or share that content. By submitting content, you grant only the limited permission needed to operate the requested feature, process the request and return its result. Do not submit confidential or personal information unless you have authority to do so and understand the tool’s processing method.</p>
        <h2>6. Website intellectual property</h2>
        <p>Unless stated otherwise, the website’s original branding, layout, text, graphics and code are owned by or licensed to the site operator and are protected by applicable intellectual-property laws. You may use the site for personal or internal business purposes, but may not copy, sell, redistribute or create a competing service from protected site materials without permission. Third-party names, logos and products remain the property of their respective owners.</p>
        <h2>7. Third-party tools, links and listings</h2>
        <p>Directory entries may link to independent providers. A listing is provided for discovery and is not a guarantee, certification or endorsement. Third-party providers control their own features, prices, availability, terms, security and privacy practices. Review their terms before creating an account, paying for a service or sharing information. See our <Link href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</Link> for information about data processing on AIToolss.</p>
        <h2>8. Tool outputs and user review</h2>
        <p>Outputs may be incomplete, inaccurate, delayed or unsuitable for your intended purpose. Independently review results before publishing, submitting, relying on or acting on them. Some local utilities use limited algorithms and are not equivalent to professional review or comprehensive detection services. Our <Link href="/disclaimer" className="font-semibold text-violet-700 underline">Disclaimer</Link> explains important limitations.</p>
        <h2>9. Availability, changes and suspension</h2>
        <p>We may add, modify, limit, suspend or discontinue any part of the website without guaranteeing advance notice. We do not promise uninterrupted availability, compatibility with every device or browser, or permanent access to any particular listing or result.</p>
        <h2>10. No warranties</h2>
        <p>To the extent permitted by applicable law, the website and its tools are provided on an “as available” basis without warranties that they will be error-free, secure, accurate, fit for a particular purpose or continuously available. Nothing in these terms excludes a consumer right or warranty that cannot lawfully be excluded.</p>
        <h2>11. Limitation of liability</h2>
        <p>To the extent permitted by applicable law, the site operator is not liable for indirect, incidental, special or consequential loss, loss of data, profits or business opportunities, or decisions made in reliance on tool outputs or third-party services. Nothing in these terms limits liability where such limitation is prohibited by law, including liability that cannot legally be excluded.</p>
        <h2>12. Indemnity</h2>
        <p>To the extent permitted by law, you are responsible for claims or losses arising from your unlawful use of the website, your breach of these terms or your infringement of another person’s rights.</p>
        <h2>13. Privacy and cookies</h2>
        <p>Your use of the website is also subject to our <Link href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</Link> and <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent Preferences</Link>, which explain information handling and browser storage choices.</p>
        <h2>14. Changes to these terms</h2>
        <p>We may update these terms as features, providers or legal requirements change. The latest version will be published on this page with its review date. Continued use after an update takes effect means you accept the revised terms, to the extent permitted by law.</p>
        <h2>15. Contact</h2>
        <p>Questions about these terms can be sent to <a href="mailto:aitoolss4u@gmail.com" className="font-semibold text-violet-700 underline">aitoolss4u@gmail.com</a> or through the <Link href="/contact-us" className="font-semibold text-violet-700 underline">Contact Us page</Link>.</p>
      </div>
    </CmsPageContent>
    <LegalPageLinks />
  </article></main></PublicSiteChrome>;
}
