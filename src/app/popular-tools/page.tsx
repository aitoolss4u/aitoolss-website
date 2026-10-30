"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";
import { tools } from "@/lib/tools";

export default function PopularToolsPage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/popular-tools").then((response) => response.ok ? response.json() : { slugs: [] })
      .then((data) => setSlugs(Array.isArray(data.slugs) ? data.slugs.filter((slug: unknown): slug is string => typeof slug === "string") : []))
      .catch(() => setSlugs([])).finally(() => setLoaded(true));
  }, []);
  const ranked = slugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof tools)[number] => Boolean(tool));
  return <PublicSiteChrome><main className="info-page"><section className="info-article">
    <p className="section-kicker">BASED ON REAL VISITS</p><h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Popular tools.</h1>
    <p className="section-description mt-4 max-w-2xl text-base leading-7">Tools are ordered using recorded selections from the recent 30-day activity window. We do not invent popularity scores or reviews.</p>
    {!loaded ? <p className="mt-8">Loading current activity…</p> : ranked.length ? <div className="related-tools-grid mt-8">{ranked.map((tool) => <Link key={tool.slug} href={`/tools/${tool.slug}`} className="related-tool-card"><strong>{tool.icon} {tool.name}</strong><span>{tool.category} · {tool.description}</span></Link>)}</div> : <p className="mt-8 rounded-2xl border border-[#e8e2f2] bg-white p-6 text-[#6e657d]">There is not enough recorded selection activity to publish a popularity ranking yet. Explore the catalogue or browse categories while activity builds.</p>}
    <p className="mt-6"><Link href="/categories" className="text-[#654cc1] underline">Browse all categories</Link></p>
  </section></main></PublicSiteChrome>;
}
