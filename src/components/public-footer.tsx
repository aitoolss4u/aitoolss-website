"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories as catalogCategories, tools as catalogTools } from "@/lib/tools";
import type { PublicCategory } from "./public-sidebar";

type SocialLinks = Record<string, string>;
type SocialProfile = readonly [key: string, label: string, kind: "facebook" | "instagram" | "x" | "linkedin"];

const socialProfiles: SocialProfile[] = [
  ["socialFacebook", "Facebook", "facebook"],
  ["socialInstagram", "Instagram", "instagram"],
  ["socialX", "X", "x"],
  ["socialLinkedIn", "LinkedIn", "linkedin"],
];
const popularFallbackSlugs = [
  "prompt-generator",
  "word-counter",
  "image-compressor",
  "json-formatter",
  "color-palette-builder",
  "text-summarizer",
];

function SocialIcon({ kind }: { kind: SocialProfile[2] }) {
  if (kind === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.6V13h2.7v8h3.4Z" /></svg>;
  if (kind === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.6" cy="6.8" r=".8" fill="currentColor" stroke="none" /></svg>;
  if (kind === "x") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 4 14 16M19 4 5 20M7.5 4H5l11.5 16H19" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M5 8.5h3V19H5zM6.5 4.8a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM10 8.5h2.9V10h.1c.4-.8 1.4-1.8 3.2-1.8 3.4 0 4 2.2 4 5V19h-3v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V19h-3.1V8.5Z" /></svg>;
}

export default function PublicFooter({ categories }: { categories?: PublicCategory[] }) {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [popularSlugs, setPopularSlugs] = useState<string[]>([]);
  const [remoteCategories, setRemoteCategories] = useState<PublicCategory[]>(
    catalogCategories.map((name) => ({
      name,
      count: catalogTools.filter((tool) => tool.category === name).length,
    })),
  );
  const visibleCategories = categories ?? remoteCategories;

  useEffect(() => {
    fetch("/api/social-links")
      .then((response) => response.ok ? response.json() : { links: {} })
      .then((data) => setSocialLinks(data.links && typeof data.links === "object" ? data.links : {}))
      .catch(() => setSocialLinks({}));

    fetch("/api/popular-tools")
      .then((response) => response.ok ? response.json() : { slugs: [] })
      .then((data) => setPopularSlugs(Array.isArray(data.slugs) ? data.slugs.filter((slug: unknown): slug is string => typeof slug === "string") : []))
      .catch(() => setPopularSlugs([]));

    if (!categories) {
      fetch("/api/categories")
        .then((response) => response.ok ? response.json() : { categories: catalogCategories })
        .then((data) => {
          if (Array.isArray(data.categories)) {
            const names = data.categories.filter((name: unknown): name is string => typeof name === "string" && catalogCategories.includes(name));
            setRemoteCategories(names.length ? names.map((name: string) => ({
              name,
              count: catalogTools.filter((tool) => tool.category === name).length,
            })) : catalogCategories.map((name) => ({
              name,
              count: catalogTools.filter((tool) => tool.category === name).length,
            })));
          }
        })
        .catch(() => undefined);
    }
  }, [categories]);

  const popularTools = useMemo(() => {
    const ranked = popularSlugs.map((slug) => catalogTools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof catalogTools)[number] => Boolean(tool));
    const bySlug = new Map<string, (typeof catalogTools)[number]>();
    for (const tool of [...ranked, ...popularFallbackSlugs.map((slug) => catalogTools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof catalogTools)[number] => Boolean(tool))]) {
      if (!bySlug.has(tool.slug)) bySlug.set(tool.slug, tool);
      if (bySlug.size === 6) break;
    }
    return [...bySlug.values()];
  }, [popularSlugs]);

  return (
    <footer className="professional-footer">
      <div className="footer-inner">
        <section className="footer-section footer-brand-column" aria-labelledby="footer-brand-heading">
          <h2 id="footer-brand-heading" className="sr-only">AIToolss</h2>
          <Link href="/" aria-label="AIToolss home" className="footer-brand">
            <span className="light-brand-mark" aria-hidden="true">A</span><span>AIToolss<span className="footer-brand-dot">.</span></span>
          </Link>
          <p>A thoughtful collection of practical tools for creativity, productivity, coding and everyday work.</p>
          <div className="footer-socials" aria-label="Configured social media accounts">
            {socialProfiles.map(([key, label, kind]) => socialLinks[key] ? (
              <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                <SocialIcon kind={kind} />
              </a>
            ) : null)}
          </div>
        </section>

        <section className="footer-section" aria-labelledby="footer-popular-heading">
          <h3 id="footer-popular-heading">Popular Tools</h3>
          <nav className="footer-link-list" aria-label="Popular tools">
            {popularTools.map((tool) => <Link key={tool.slug} href={`/tools/${tool.slug}`}>{tool.name}</Link>)}
          </nav>
        </section>

        <section className="footer-section" aria-labelledby="footer-categories-heading">
          <h3 id="footer-categories-heading">Categories</h3>
          <nav className="footer-link-list" aria-label="Top categories">
            {visibleCategories.slice(0, 6).map((category) => <Link key={category.name} href={`/?category=${encodeURIComponent(category.name)}#search`}>{category.name}</Link>)}
          </nav>
        </section>

        <section className="footer-section" aria-labelledby="footer-resources-heading">
          <h3 id="footer-resources-heading">Resources</h3>
          <nav className="footer-link-list" aria-label="Resources">
            <Link href="/types-of-tools">Types of Tools</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/popular-tools">Popular Tools</Link>
            <Link href="/new-trending-tools">New &amp; Trending Tools</Link>
          </nav>
        </section>

        <section className="footer-section footer-section-company" aria-labelledby="footer-company-heading">
          <h3 id="footer-company-heading">Company &amp; Legal</h3>
          <nav className="footer-link-list" aria-label="Company and legal">
            <Link href="/about">About</Link>
            <Link href="/contact-us">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/cookie-consent">Cookie / Consent</Link>
          </nav>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AIToolss. All rights reserved.</span>
        <Link href="/admin-login">Admin</Link>
      </div>
    </footer>
  );
}
