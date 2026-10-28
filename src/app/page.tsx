"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tools as catalogTools, categories as toolCategories } from "@/lib/tools";

const tools = catalogTools.map((tool) => ({ ...tool, href: "/tools/" + tool.slug }));

const categoryMeta = [
  { name: "All tools", icon: "✳", subtitle: "Everything in one place" },
  ...toolCategories.map((name) => ({ name, icon: name === "Writing" ? "Aa" : name === "Images" ? "◈" : name === "Productivity" ? "ϟ" : name === "Coding" ? "{ }" : name === "Marketing" ? "↗" : name === "Education" ? "▤" : name === "Business" ? "◇" : "▣", subtitle: name + " tools and utilities" })),
];

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/" },
  { name: "Instagram", href: "https://www.instagram.com/" },
  { name: "YouTube", href: "https://www.youtube.com/" },
  { name: "LinkedIn", href: "https://www.linkedin.com/" },
  { name: "X", href: "https://x.com/" },
];

const popularSearches = ["Writing", "Images", "Coding", "Productivity"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All tools");

  const categories = useMemo(
    () => categoryMeta.map((category) => ({
      ...category,
      count: category.name === "All tools" ? tools.length : tools.filter((tool) => tool.category === category.name).length,
    })),
    [],
  );

  const visibleTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatches = activeCategory === "All tools" || tool.category === activeCategory;
      const queryMatches = !normalized || [tool.name, tool.category, tool.description, tool.label, tool.slug].join(" ").toLowerCase().includes(normalized);
      return categoryMatches && queryMatches;
    });
  }, [query, activeCategory]);

  function resetFilters() {
    setQuery("");
    setActiveCategory("All tools");
  }

  return (
    <main className="site-shell min-h-screen overflow-hidden">
      <header className="site-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" aria-label="AIToolss home" className="brand-lockup flex shrink-0 items-center gap-3">
            <span className="brand-mark grid h-10 w-10 place-items-center rounded-xl text-lg font-black">A</span>
            <span className="text-xl font-extrabold tracking-tight">AIToolss<span className="brand-dot">.</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a className="nav-link" href="#tools">Discover</a>
            <a className="nav-link" href="#categories">Categories</a>
            <a className="nav-link" href="#about">About</a>
          </nav>
          <a href="#tools" className="header-cta rounded-full px-5 py-2.5 text-sm font-bold">Explore tools <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="showcase-hero relative px-5 pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div aria-hidden="true" className="showcase-grid" />
        <div aria-hidden="true" className="showcase-glow showcase-glow-left" />
        <div aria-hidden="true" className="showcase-glow showcase-glow-right" />
        <div className="relative mx-auto max-w-7xl">
          <div className="showcase-intro mx-auto text-center">
            <div className="hero-pill mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:text-sm">
              <span className="live-dot" /> THE AI TOOL DISCOVERY PLAYGROUND
            </div>
            <h1 className="showcase-title mx-auto max-w-6xl text-5xl font-black leading-[.94] tracking-[-.065em] sm:text-7xl lg:text-[6.8rem]">
              BIG IDEAS.
              <span className="showcase-title-accent block">BETTER TOOLS.</span>
              <span className="showcase-title-last block">MORE POSSIBLE.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
              Find useful AI tools for writing, visuals, work and everything you want to make next. One curated space. More room to create.
            </p>
            <form onSubmit={(event) => { event.preventDefault(); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} role="search" className="search-box showcase-search mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl p-2">
              <span aria-hidden="true" className="search-symbol pl-3 text-2xl">⌕</span>
              <input aria-label="Search AI tools" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you want to make today?" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none sm:text-base" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="clear-search rounded-full px-2 py-1 text-sm">×</button>}
              <button type="submit" className="search-button rounded-xl px-5 py-3 text-sm font-bold sm:px-7">Discover <span aria-hidden="true">→</span></button>
            </form>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="hero-muted mr-1">Explore:</span>
              {popularSearches.map((item) => <button key={item} onClick={() => { setActiveCategory(item); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} className={`popular-chip rounded-full px-3 py-1.5 transition ${activeCategory === item ? "popular-chip-active" : ""}`}>{item}</button>)}
            </div>
          </div>

          <div className="showcase-art mt-14 grid grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:gap-4" aria-label="Explore tool categories">
            <button onClick={() => { setActiveCategory("Images"); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} className="art-tile art-tile-image">
              <span className="art-tile-label">01 / VISUALS</span><span className="art-visual art-visual-sphere" aria-hidden="true" /><span className="art-tile-bottom"><strong>Make it visual</strong><span>Image tools ↗</span></span>
            </button>
            <button onClick={() => { setActiveCategory("Writing"); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} className="art-tile art-tile-writing">
              <span className="art-tile-label">02 / WORDS</span><span className="art-visual art-visual-type" aria-hidden="true">Aa</span><span className="art-tile-bottom"><strong>Find your words</strong><span>Writing tools ↗</span></span>
            </button>
            <button onClick={() => { setActiveCategory("Coding"); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} className="art-tile art-tile-code">
              <span className="art-tile-label">03 / BUILD</span><span className="art-visual art-visual-code" aria-hidden="true">&lt;/&gt;</span><span className="art-tile-bottom"><strong>Build something</strong><span>Coding tools ↗</span></span>
            </button>
            <button onClick={() => { setActiveCategory("Productivity"); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} className="art-tile art-tile-focus">
              <span className="art-tile-label">04 / FOCUS</span><span className="art-visual art-visual-orbit" aria-hidden="true"><i /><i /><i /></span><span className="art-tile-bottom"><strong>Make room to think</strong><span>Productivity ↗</span></span>
            </button>
          </div>

          <div className="hero-stats mx-auto mt-10 grid max-w-4xl grid-cols-3 gap-3 sm:mt-12 sm:gap-5">
            <div className="stat-card"><span className="stat-number">{tools.length}<span>+</span></span><span className="stat-label">Tools to explore</span></div>
            <div className="stat-card"><span className="stat-number">08</span><span className="stat-label">Discovery categories</span></div>
            <div className="stat-card"><span className="stat-number">100<span>%</span></span><span className="stat-label">Made for curious minds</span></div>
          </div>
        </div>
      </section>

      <section id="categories" className="content-section px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="section-heading flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="section-kicker">FIND YOUR FLOW</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Explore by category<span className="heading-period">.</span></h2><p className="section-description mt-3 max-w-xl text-sm leading-6 sm:text-base">A little less overwhelm. A lot more of what you came here to do.</p></div>
            <span className="section-note">{tools.length} tools listed · growing steadily</span>
          </div>
          <div className="category-grid mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
            {categories.filter((category) => category.name !== "All tools").map((category, index) => (
              <button key={category.name} onClick={() => { setActiveCategory(category.name); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} aria-pressed={activeCategory === category.name} className={`category-card category-accent-${index % 4} rounded-2xl p-4 text-left sm:p-5 ${activeCategory === category.name ? "category-card-active" : ""}`}>
                <span className="category-icon grid h-11 w-11 place-items-center rounded-xl text-lg font-bold">{category.icon}</span>
                <span className="mt-4 flex items-center justify-between gap-2"><span className="text-sm font-bold sm:text-base">{category.name}</span><span className="category-count">{category.count}</span></span>
                <span className="category-subtitle mt-1 block text-xs sm:text-sm">{category.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="tools-section scroll-mt-24 px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="section-kicker">THE TOOLKIT</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Good tools. Big ideas<span className="heading-period">.</span></h2><p className="section-description mt-3 text-sm sm:text-base">Find your next shortcut, spark, or starting point.</p></div>
            <div className="results-count"><span className="results-pulse" /> {visibleTools.length} {visibleTools.length === 1 ? "tool" : "tools"} found</div>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {categories.map((category) => <button key={category.name} onClick={() => setActiveCategory(category.name)} aria-pressed={activeCategory === category.name} className={`filter-chip rounded-full px-4 py-2 text-sm font-semibold ${activeCategory === category.name ? "filter-chip-active" : ""}`}>{category.name}</button>)}
          </div>
          {visibleTools.length ? (
            <div className="tool-grid mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTools.map((tool, index) => (
                <article key={tool.name} className={`tool-card tool-tone-${tool.tone}`} style={{ animationDelay: `${index * 45}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="tool-icon grid h-12 w-12 place-items-center rounded-2xl text-lg font-extrabold">{tool.icon}</span>
                    <span className={`tool-status ${tool.label === "READY TO USE" ? "tool-status-ready" : "tool-status-soon"}`}><span />{tool.label}</span>
                  </div>
                  <p className="tool-category mt-6 text-xs font-bold uppercase tracking-[.15em]">{tool.category}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight">{tool.name}</h3>
                  <p className="tool-description mt-2 min-h-[3.5rem] text-sm leading-6">{tool.description}</p>
                  <div className="tool-card-footer mt-6 flex items-center justify-between gap-3 border-t pt-4">
                    <span className="text-xs font-semibold">Available now</span>
                    <Link href={tool.href} className="tool-arrow" aria-label={`Open ${tool.name}`}>↗</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-8 rounded-3xl px-6 py-14 text-center sm:px-10">
              <span className="empty-icon mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl">⌕</span>
              <h3 className="mt-5 text-xl font-bold">No exact match just yet</h3>
              <p className="section-description mx-auto mt-2 max-w-md text-sm leading-6">Try a different keyword or clear your filters to see all the tools currently in the directory.</p>
              <button onClick={resetFilters} className="search-button mt-6 rounded-xl px-5 py-3 text-sm font-bold">Show all tools ↗</button>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="px-5 pb-20 pt-8 sm:pb-28">
        <div className="about-panel relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div aria-hidden="true" className="about-glow" />
          <div className="relative">
            <p className="section-kicker">MADE FOR WHAT&apos;S NEXT</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">Your ideas deserve <span className="hero-gradient">better tools.</span></h2>
            <p className="section-description mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base">AIToolss is building a calmer, clearer way to discover helpful tools—without the noise.</p>
            <a href="#tools" className="about-cta mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold">Explore the toolkit <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <footer className="site-footer px-5 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="footer-main grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="footer-brand">
              <Link href="/" aria-label="AIToolss home" className="brand-lockup inline-flex items-center gap-3">
                <span className="brand-mark grid h-10 w-10 place-items-center rounded-xl text-lg font-black">A</span>
                <span className="text-xl font-extrabold tracking-tight text-white">AIToolss<span className="brand-dot">.</span></span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6">A growing directory of useful AI tools and smart utilities to help you create, learn and get things done.</p>
              <p className="footer-social-title mt-6 text-xs font-bold uppercase tracking-[.16em]">Follow the journey</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noreferrer noopener" aria-label={`${social.name} (update to the official AIToolss profile when available)`} title={social.name} className={`social-link social-${social.name.toLowerCase()}`}><svg aria-hidden="true" viewBox="0 0 24 24" className="social-icon" focusable="false">{social.name === "Facebook" ? <path d="M13.5 21v-8.2h2.8l.42-3.2H13.5V7.56c0-.93.26-1.56 1.6-1.56h1.71V3.14A22.4 22.4 0 0 0 14.32 3C11.85 3 10.16 4.5 10.16 7.27V9.6H7.4v3.2h2.76V21h3.34Z" fill="currentColor" /> : social.name === "Instagram" ? <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" fill="none" stroke="currentColor" strokeWidth="2.2" /><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="2.2" /><circle cx="17.7" cy="6.6" r="1.25" fill="currentColor" /></> : social.name === "YouTube" ? <><path d="M23 7.1a3 3 0 0 0-2.1-2.12C19.05 4.45 12 4.45 12 4.45s-7.05 0-8.9.53A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.12c1.85.53 8.9.53 8.9.53s7.05 0 8.9-.53A3 3 0 0 0 23 16.9a31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9Z" fill="currentColor" /><path d="m9.7 15.5 5.9-3.5-5.9-3.5v7Z" fill="#080a11" /></> : social.name === "LinkedIn" ? <path d="M5.1 8.4a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2ZM3.3 10h3.6v10.7H3.3V10Zm5.8 0h3.45v1.46h.05a3.78 3.78 0 0 1 3.4-1.87c3.64 0 4.32 2.4 4.32 5.52v5.59h-3.6v-4.96c0-1.18-.02-2.7-1.65-2.7-1.66 0-1.91 1.29-1.91 2.62v5.04H9.1V10Z" fill="currentColor" /> : <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.43L5.55 22H2.4l7.25-8.28L1.8 2h6.4l4.43 6.77L18.9 2Zm-1.1 17.85h1.73L7.28 4.04H5.42L17.8 19.85Z" fill="currentColor" />}</svg></a>)}
              </div>
              <p className="footer-note mt-3 max-w-xs text-xs leading-5">Social profile links are starter links. Replace them with AIToolss official account URLs before launch.</p>
            </div>
            <div>
              <h2 className="footer-heading">Explore</h2>
              <ul className="footer-link-list mt-4 space-y-3">
                {categoryMeta.filter((category) => category.name !== "All tools").map((category) => <li key={category.name}><a href="#tools" onClick={() => setActiveCategory(category.name)}>{category.name}</a></li>)}
                <li><a href="#tools" onClick={() => setActiveCategory("All tools")}>All tools</a></li>
              </ul>
            </div>
            <div>
              <h2 className="footer-heading">Discover</h2>
              <ul className="footer-link-list mt-4 space-y-3">
                <li><a href="#tools">Popular tools</a></li>
                <li><a href="#categories">Browse categories</a></li>
                <li><a href="#about">About AIToolss</a></li>
              </ul>
            </div>
            <div>
              <h2 className="footer-heading">Legal & support</h2>
              <ul className="footer-link-list mt-4 space-y-3">
                <li><Link href="/privacy">Privacy policy</Link></li>
                <li><Link href="/terms">Terms of use</Link></li>
                <li><a href="mailto:hello@aitoolss.com">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom mt-12 flex flex-col gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 AIToolss. Built for curious minds.</p>
            <p>Useful tools. More possibilities.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
