"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const tools = [
  { name: "Text Summarizer", category: "Writing", icon: "✦", tone: "violet", description: "Turn long articles, notes, and documents into clear, useful summaries.", label: "READY TO USE", href: "/tools/text-summarizer" },
  { name: "Word Counter", category: "Writing", icon: "Aa", tone: "cyan", description: "Count words and characters, and estimate reading time in seconds.", label: "READY TO USE", href: "/tools/word-counter" },
  { name: "Image Compressor", category: "Images", icon: "▧", tone: "pink", description: "Shrink image file sizes in your browser while keeping them looking sharp.", label: "READY TO USE", href: "/tools/image-compressor" },
  { name: "Prompt Generator", category: "Productivity", icon: "✳", tone: "orange", description: "Turn a rough idea into a clearer prompt for your next AI workflow.", label: "IN THE WORKS", href: "/tools/prompt-generator" },
  { name: "Code Explainer", category: "Coding", icon: "{ }", tone: "cyan", description: "Make unfamiliar code easier to understand, one snippet at a time.", label: "IN THE WORKS", href: "/tools/code-explainer" },
  { name: "Video Description", category: "Marketing", icon: "▶", tone: "pink", description: "Build a stronger starting point for video descriptions and captions.", label: "IN THE WORKS", href: "/tools/video-description" },
  { name: "Study Notes", category: "Education", icon: "▤", tone: "orange", description: "Organize learning material into structured, easy-to-review notes.", label: "IN THE WORKS", href: "/tools/study-notes" },
  { name: "Business Name Ideas", category: "Business", icon: "◇", tone: "violet", description: "Explore memorable naming directions for your next big idea.", label: "IN THE WORKS", href: "/tools/business-name-ideas" },
  { name: "Resume Checklist", category: "Career", icon: "▣", tone: "cyan", description: "Check the essentials before sending your resume to an employer.", label: "IN THE WORKS", href: "/tools/resume-checklist" },
];

const categoryMeta = [
  { name: "All tools", icon: "✳", subtitle: "Everything in one place" },
  { name: "Writing", icon: "Aa", subtitle: "Words, ideas & clarity" },
  { name: "Images", icon: "◈", subtitle: "Visuals & image utilities" },
  { name: "Productivity", icon: "ϟ", subtitle: "Work smarter every day" },
  { name: "Coding", icon: "{ }", subtitle: "Build and understand" },
  { name: "Marketing", icon: "↗", subtitle: "Content that connects" },
  { name: "Education", icon: "▤", subtitle: "Learn with less friction" },
  { name: "Business", icon: "◇", subtitle: "Ideas into action" },
  { name: "Career", icon: "▣", subtitle: "Your next opportunity" },
];

const socialLinks = [
  { name: "GitHub", icon: "GH", href: "https://github.com/aitoolss4u/aitoolss-website" },
  { name: "Instagram", icon: "IG", href: "https://www.instagram.com/" },
  { name: "YouTube", icon: "YT", href: "https://www.youtube.com/" },
  { name: "LinkedIn", icon: "in", href: "https://www.linkedin.com/" },
  { name: "X", icon: "𝕏", href: "https://x.com/" },
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
      const queryMatches = !normalized || [tool.name, tool.category, tool.description, tool.label].join(" ").toLowerCase().includes(normalized);
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
                    <span className="text-xs font-semibold">{tool.label === "READY TO USE" ? "Available now" : "On our roadmap"}</span>
                    {tool.label === "READY TO USE" ? <Link href={tool.href} className="tool-arrow" aria-label={`Open ${tool.name}`}>↗</Link> : <span className="tool-arrow tool-arrow-muted" aria-label="Coming soon">＋</span>}
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
            <p className="section-kicker">MADE FOR WHAT'S NEXT</p>
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
                {socialLinks.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noreferrer noopener" aria-label={`${social.name} (update to the official AIToolss profile when available)`} title={social.name} className="social-link"><span aria-hidden="true">{social.icon}</span></a>)}
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
