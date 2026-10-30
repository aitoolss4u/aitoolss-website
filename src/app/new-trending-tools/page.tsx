import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import { tools } from "@/lib/tools";

export const metadata = {
  title: "New & Trending Tools",
  description: "Explore the AIToolss catalogue and its available tool collections.",
};

export default function NewTrendingToolsPage() {
  return <PublicSiteChrome><main className="info-page"><section className="info-article">
    <p className="section-kicker">DISCOVER THE CATALOGUE</p><h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">New &amp; trending tools.</h1>
    <p className="section-description mt-4 max-w-2xl text-base leading-7">We only label tools as new or trending when reliable publication dates or trend signals are available. The current catalogue does not expose those fields, so this page avoids inventing dates or rankings.</p>
    <div className="related-tools-grid mt-8">{tools.slice(0, 12).map((tool) => <Link key={tool.slug} href={`/tools/${tool.slug}`} className="related-tool-card"><strong>{tool.icon} {tool.name}</strong><span>{tool.category} · {tool.description}</span></Link>)}</div>
    <p className="mt-6 text-sm text-[#777087]">Showing catalogue tools in their configured order, not a claim that these are the newest or most-trending entries.</p>
  </section></main></PublicSiteChrome>;
}
