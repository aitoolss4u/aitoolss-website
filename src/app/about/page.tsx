import type { Metadata } from "next";
import { getCmsMetadata } from "@/lib/content-pages";
import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
import LegalPageLinks from "@/components/legal-page-links";

const fallbackMetadata: Metadata = {
  title: "About",
  description: "Learn what AIToolss offers, how to discover online tools, how browser-based utilities work and how we approach transparency, privacy and useful tool information.",
  alternates: { canonical: "/about" },
};
export async function generateMetadata(): Promise<Metadata> {
  return getCmsMetadata("about", fallbackMetadata);
}

export default function AboutPage() {
  return (
    <PublicSiteChrome>
      <main className="info-page">
        <article className="info-article">
          <CmsPageContent
            slug="about"
            fallbackTitle="About AIToolss"
            fallbackIntro="AIToolss brings practical online tools and useful digital resources together in one place. Explore writing, image, productivity, coding, marketing, education, business and career tools, then choose the utility that fits the task you want to complete."
            preserveChildren
          >
            <div className="cms-fallback-body">
              <h2>Our purpose: make useful tools easier to discover</h2>
              <p>Finding the right online tool can take longer than completing the task itself. AIToolss is designed to make discovery simpler by organizing a growing collection of digital tools and browser-friendly utilities into clear categories. Whether you want to format text, explore an idea, prepare an image, organize work or complete a small calculation, you can start with a focused tool page rather than searching through unrelated software.</p>
              <p>Our aim is practical discovery: clear descriptions, straightforward interfaces and useful context that helps visitors decide whether a tool is appropriate for their needs.</p>

              <h2>Explore tools by task and category</h2>
              <p>The directory groups tools into Writing, Images, Productivity, Coding, Marketing, Education, Business and Career. Browse the <Link href="/categories" className="font-semibold text-violet-700 underline">tool categories</Link>, review the <Link href="/types-of-tools" className="font-semibold text-violet-700 underline">types of tools</Link>, or return to the <Link href="/#search" className="font-semibold text-violet-700 underline">AIToolss home page</Link> and search by a tool name, topic or task.</p>
              <p>Each tool page is intended to explain its main purpose, show the available controls and provide usage guidance. Features can vary between tools, so check the individual page before submitting information or relying on a result.</p>

              <h2>How tools on AIToolss work</h2>
              <p>AIToolss includes different kinds of utilities. Some tools process text or files directly in your browser. Other features may contact an AIToolss server, a public data service or an independent third-party provider. A directory listing may also link to a provider's own website, where its features, account requirements and privacy practices apply.</p>
              <p>Do not assume that every tool works offline or that every provider has the same data-handling rules. The tool page and the provider's own documentation are the best places to check supported formats, limitations and processing details. Avoid entering passwords, payment information or confidential data into tools unless you have reviewed how that specific service handles it.</p>

              <h2>Our approach to useful and transparent information</h2>
              <p>We aim to describe tools in plain language and distinguish browser-based utilities from services operated by other providers. Tool features, prices, availability and provider terms can change. A listing is provided to help with discovery; it is not a guarantee that a third-party product is available, accurate, secure or suitable for every user.</p>
              <p>Some free utilities use simple, deterministic rules rather than a trained artificial-intelligence model. Their results can be useful starting points, but they may not have the context or accuracy of specialist software or human review. Where a tool has important limitations, those should be explained on its page and in our <Link href="/disclaimer" className="font-semibold text-violet-700 underline">Disclaimer</Link>.</p>

              <h2>Privacy and responsible use</h2>
              <p>Your privacy matters. Depending on the tool, information may stay in your browser or be sent to a server or external provider to complete the requested operation. Our <Link href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</Link> explains the categories of information the website may process, why it is used and the choices available to visitors.</p>
              <p>You can review optional browser storage and consent choices on the <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent Preferences</Link> page. Use of the website is also governed by our <Link href="/terms" className="font-semibold text-violet-700 underline">Terms &amp; Conditions</Link>. Please use tools lawfully and make sure you have the rights and permissions needed for any content you submit.</p>

              <h2>Independent providers and external links</h2>
              <p>Some directory entries connect to independent websites, applications or services. Those providers operate their own products and control their own pricing, availability, account requirements, security measures and privacy policies. Before signing up, paying for a product or uploading information to an external service, review the provider's current terms and privacy notice. A link or listing should not be read as certification or endorsement.</p>

              <h2>Feedback, corrections and tool suggestions</h2>
              <p>Good directories improve when visitors point out broken links, outdated details, confusing instructions or useful tools that are missing. If you notice a problem or want to suggest a listing, please use our <Link href="/contact-us" className="font-semibold text-violet-700 underline">Contact Us page</Link>. Include the relevant page address and a short explanation so the team can understand the request.</p>

              <h2>Learn more about AIToolss</h2>
              <p>For details about information handling, read the <Link href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</Link>. For website rules, see <Link href="/terms" className="font-semibold text-violet-700 underline">Terms &amp; Conditions</Link>. For important tool and content limitations, read the <Link href="/disclaimer" className="font-semibold text-violet-700 underline">Disclaimer</Link>. You can update optional storage choices through <Link href="/cookie-consent" className="font-semibold text-violet-700 underline">Cookie &amp; Consent Preferences</Link>, or contact us directly at <a href="mailto:aitoolss4u@gmail.com" className="font-semibold text-violet-700 underline">aitoolss4u@gmail.com</a>.</p>
            </div>
          </CmsPageContent>
          <LegalPageLinks />
        </article>
      </main>
    </PublicSiteChrome>
  );
}
