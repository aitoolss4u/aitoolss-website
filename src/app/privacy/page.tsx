import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
const fallbackMetadata: Metadata = { title: "Privacy Policy", description: "How AIToolss handles contact messages, site activity, authentication and tool inputs." };
export async function generateMetadata(): Promise<Metadata> { return getCmsMetadata("privacy", fallbackMetadata); }
export default function PrivacyPage() {
 return <PublicSiteChrome><main className="info-page"><article className="info-article">
  <CmsPageContent slug="privacy" fallbackTitle="Privacy Policy" fallbackIntro="How AIToolss handles information submitted through the website. Last updated: October 30, 2026.">
   <div className="cms-fallback-body">
    <h2>Information you submit</h2><p>If you use the Contact Us form, the website receives your name, email address, subject and message. When email delivery is configured, it sends the message to aitoolss4u@gmail.com through Resend. Do not submit passwords, payment details or sensitive information.</p>
    <h2>Tool inputs and outputs</h2><p>Browser-based utilities process input locally unless a tool clearly identifies an external AI feature. When an AI feature is enabled, the text you submit is sent securely from our server to the configured model provider. Do not submit sensitive or confidential information.</p>
    <h2>Site activity and popularity</h2><p>When a visitor opens a tool through a tracked selection link, the site may record the tool slug and timestamp to create a recent popularity list. This event does not include raw search text.</p>
    <h2>Accounts and service providers</h2><p>Administrative authentication and site data are handled by Supabase. Contact email delivery, when enabled, is handled by Resend. Hosting providers may process technical request logs.</p>
    <h2>Cookies and local storage</h2><p>Essential browser storage may support core functions and sign-in sessions. Optional analytics should remain disabled unless a provider is configured and the visitor has given required consent. See the <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent page</Link>.</p>
    <h2>Retention and requests</h2><p>Contact messages may remain in email systems. Database records are retained according to the configured Supabase project. For privacy requests, contact aitoolss4u@gmail.com.</p>
    <h2>Changes</h2><p>This policy is updated when features or providers change. It describes the current implementation and does not claim unconfigured services are active.</p>
   </div>
  </CmsPageContent>
 </article></main></PublicSiteChrome>;
}
