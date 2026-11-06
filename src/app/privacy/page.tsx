import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
import LegalPageLinks from "@/components/legal-page-links";

const fallbackMetadata: Metadata = {
  title: "Privacy Policy",
  description: "Read how AIToolss collects, uses, stores and protects contact details, tool inputs, browser storage and technical information.",
  alternates: { canonical: "/privacy" },
};
export async function generateMetadata(): Promise<Metadata> { return getCmsMetadata("privacy", fallbackMetadata); }

export default function PrivacyPage() {
  return <PublicSiteChrome><main className="info-page"><article className="info-article">
    <CmsPageContent slug="privacy" fallbackTitle="Privacy Policy" fallbackIntro="This Privacy Policy explains what information AIToolss receives, why it is used, which service providers may process it, and the choices available to visitors. Last updated: November 6, 2026." preserveChildren>
      <div className="cms-fallback-body">
        <h2>1. About this policy</h2>
        <p>AIToolss (also referred to as “we”, “us” or “our”) operates <Link href="/" className="font-semibold text-violet-700 underline">aitoolss.com</Link>, a tool discovery directory and collection of browser-based utilities. This policy describes the website’s current and intended data practices. Read it with our <Link href="/terms" className="font-semibold text-violet-700 underline">Terms &amp; Conditions</Link>, <Link href="/disclaimer" className="font-semibold text-violet-700 underline">Disclaimer</Link> and <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent page</Link>.</p>
        <h2>2. Information we may receive</h2>
        <p><strong>Contact information:</strong> When you submit the Contact Us form, we receive the name, email address, subject and message you provide. Do not include passwords, payment-card information, government identifiers or other sensitive information.</p>
        <p><strong>Tool inputs:</strong> Information entered into a utility may be processed in your browser or sent to a server or third-party provider when that tool requires external processing. The method can differ by tool. Read the individual tool page before submitting private or confidential material.</p>
        <p><strong>Technical information:</strong> Hosting and security infrastructure may process standard request information such as IP address, browser and device details, requested URL, timestamps, error diagnostics and security events.</p>
        <p><strong>Usage events:</strong> The site may record a selected tool slug and timestamp to support the recent/popular tools feature. This event is not designed to collect text typed into the site search box.</p>
        <p><strong>Browser storage:</strong> The site may use essential cookies or local storage for core functions, preferences and supported sign-in sessions. The Cookie &amp; Consent page stores the preference you select in this browser.</p>
        <h2>3. How tools process your content</h2>
        <p>Some utilities process selected content locally in your browser. For example, browser-based image handling may use local file and canvas operations. Other features can require a server request, an external dictionary service, an AI/model provider or another third-party service. Where a tool sends information outside your browser, that processing is subject to the relevant provider’s systems and privacy terms as well as our disclosures.</p>
        <p>Do not assume every tool is fully offline or that every tool input is automatically deleted immediately. Check the tool’s instructions and avoid submitting information you do not have permission to share.</p>
        <h2>4. Why we use information</h2>
        <ul><li>To receive and respond to support requests, feedback, bug reports and tool suggestions.</li><li>To operate, secure, troubleshoot and maintain the website and administrative functions.</li><li>To provide requested tool functionality and return results.</li><li>To understand aggregate tool usage and improve navigation and reliability.</li><li>To prevent spam, abuse, fraud and unauthorized access.</li><li>To comply with applicable legal obligations and respond to lawful requests.</li></ul>
        <h2>5. Service providers and sharing</h2>
        <p>We do not sell personal information submitted through the Contact Us form. Information may be processed by service providers that help operate the website, including:</p>
        <ul><li><strong>Vercel:</strong> website hosting, delivery and technical infrastructure.</li><li><strong>Supabase:</strong> administrative authentication and database storage. If contact email delivery is not configured, contact messages may be saved in the website’s protected database inbox.</li><li><strong>Resend:</strong> contact email delivery when the email integration is configured. Contact messages are addressed to aitoolss4u@gmail.com and use the visitor’s email as the reply-to address.</li><li><strong>External tool providers:</strong> a provider may receive the minimum content needed when a particular tool depends on that service. Check the relevant tool page and provider policy.</li></ul>
        <p>We may also disclose information if reasonably necessary to protect the site or its users, enforce our terms, or comply with applicable law. Providers process information under their own terms and technical controls.</p>
        <h2>6. Cookies, local storage and advertising</h2>
        <p>Essential browser storage may support core site functions. The optional analytics control currently saves a browser preference; enabling that preference does not itself activate an analytics tracker. See <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent Preferences</Link>.</p>
        <p>If advertising or analytics providers are added in the future, this policy and the consent experience should be updated to identify the providers, explain their technologies and provide applicable opt-out choices before those services are activated. We do not state that Google advertising cookies or personalized ads are currently active.</p>
        <h2>7. Retention</h2>
        <p>Contact messages may remain in the database inbox and/or receiving email account for as long as needed to handle the request, maintain business records, resolve disputes or meet legal requirements. Technical logs and provider records are retained according to the relevant provider’s retention settings. We do not promise a fixed deletion period where one has not been configured.</p>
        <h2>8. Security</h2>
        <p>We use security features available through our hosting and database providers and take reasonable steps to restrict administrative access. No website, internet transmission or storage system can be guaranteed completely secure. Please do not send sensitive credentials or confidential data through the contact form.</p>
        <h2>9. Your choices and privacy requests</h2>
        <p>You can choose not to submit optional information, manage the browser preference on the <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent page</Link>, and contact us to request access, correction or deletion of information where applicable law provides those rights. We may need to verify your request and may retain information where legally permitted or required.</p>
        <p>Send privacy requests to <a href="mailto:aitoolss4u@gmail.com" className="font-semibold text-violet-700 underline">aitoolss4u@gmail.com</a> or use the <Link href="/contact-us" className="font-semibold text-violet-700 underline">Contact Us form</Link>. Any formal grievance contact or legal entity details required for your jurisdiction should be supplied by the site operator and added here rather than guessed.</p>
        <h2>10. Children’s privacy</h2>
        <p>AIToolss is a general-purpose website and is not designed to knowingly collect personal information from children in circumstances where parental consent is required. If you believe a child has submitted personal information improperly, contact us so we can review the request.</p>
        <h2>11. International processing and external websites</h2>
        <p>Our providers or their infrastructure may process information in countries other than your own. When you follow an external tool or service link, that destination is governed by its own privacy policy. A listing in our <Link href="/categories" className="font-semibold text-violet-700 underline">tool categories</Link> does not make AIToolss the operator of the linked service.</p>
        <h2>12. Changes to this policy</h2>
        <p>We may revise this policy when the site, its providers or applicable requirements change. The “Last updated” date above indicates the latest substantive review. Material changes will be reflected on this page.</p>
        <h2>13. Contact</h2>
        <p>For questions about this policy or the way information is handled, email <a href="mailto:aitoolss4u@gmail.com" className="font-semibold text-violet-700 underline">aitoolss4u@gmail.com</a>. You can also read <Link href="/about" className="font-semibold text-violet-700 underline">About AIToolss</Link> to understand the purpose of the website.</p>
      </div>
    </CmsPageContent>
    <LegalPageLinks />
  </article></main></PublicSiteChrome>;
}
