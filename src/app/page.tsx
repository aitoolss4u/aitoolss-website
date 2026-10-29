"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { tools as catalogTools, categories as toolCategories } from "@/lib/tools";

const tools = catalogTools.map((tool) => ({ ...tool, href: "/tools/" + tool.slug }));
const categoryMeta = [
  { name: "Writing", icon: "Aa", tint: "lilac", subtitle: "Words, tone and ideas" },
  { name: "Images", icon: "◈", tint: "peach", subtitle: "Visuals and color" },
  { name: "Productivity", icon: "✳", tint: "blue", subtitle: "Plan and focus" },
  { name: "Coding", icon: "{ }", tint: "mint", subtitle: "Build and debug" },
  { name: "Marketing", icon: "↗", tint: "rose", subtitle: "Reach your audience" },
  { name: "Education", icon: "▤", tint: "gold", subtitle: "Learn something new" },
  { name: "Business", icon: "◇", tint: "sky", subtitle: "Work smarter" },
  { name: "Career", icon: "✦", tint: "lavender", subtitle: "Grow your next step" },
].filter((category) => toolCategories.includes(category.name));

const featuredSlugs = ["prompt-generator", "word-counter", "image-compressor", "json-formatter", "color-palette-builder", "text-summarizer", "password-generator", "markdown-formatter"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All tools");
  const [showTop, setShowTop] = useState(false);
  const categories = useMemo(() => categoryMeta.map((category) => ({
    ...category,
    count: tools.filter((tool) => tool.category === category.name).length,
  })), []);
  const visibleTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatches = activeCategory === "All tools" || tool.category === activeCategory;
      const searchMatches = !normalized || [tool.name, tool.description, tool.category, tool.label, tool.slug, tool.icon].join(" ").toLowerCase().includes(normalized);
      return categoryMatches && searchMatches;
    });
  }, [query, activeCategory]);
  const featured = useMemo(() => featuredSlugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof tools)[number] => Boolean(tool)), []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function chooseCategory(category: string, scroll = false) {
    setActiveCategory(category);
    if (scroll) window.setTimeout(() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function resetFilters() {
    setQuery("");
    chooseCategory("All tools");
  }

  return (
    <main className="light-shell min-h-screen">
      <header className="light-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" aria-label="AIToolss home" className="light-brand flex shrink-0 items-center gap-2.5">
            <span className="light-brand-mark">A</span><span>AIToolss<span className="brand-period">.</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#featured">Featured</a><a href="#categories">Categories</a><a href="#tools">All tools</a><a href="#about">About</a>
          </nav>
          <a href="#tools" className="light-header-cta">Explore tools <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="light-hero relative overflow-hidden px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div aria-hidden="true" className="hero-orb hero-orb-one" /><div aria-hidden="true" className="hero-orb hero-orb-two" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="light-eyebrow mx-auto"><span className="eyebrow-spark">✳</span> YOUR FRIENDLY AI TOOLKIT</div>
          <h1 className="light-hero-title mx-auto mt-6 max-w-5xl">YOUR NEXT BIG IDEA <span>STARTS HERE.</span></h1>
          <p className="light-hero-copy mx-auto mt-5 max-w-2xl">Discover useful tools for creativity, productivity, coding, research and everyday work. Find your spark, then make it happen.</p>
          <form role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} className="light-search-wrap mx-auto mt-8 max-w-3xl">
            <div className="light-search">
              <span aria-hidden="true" className="search-glyph">⌕</span>
              <input aria-label="Search AI tools" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools, ideas, or what you want to do…" />
              {query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>×</button>}
              <span className="search-sparkle" aria-hidden="true">✦</span>
              <button type="submit" className="light-search-submit">Discover <span aria-hidden="true">→</span></button>
            </div>
          </form>
          <div className="search-suggestions mt-4 flex flex-wrap items-center justify-center gap-2"><span>Try:</span>{["Writing", "Images", "Coding", "Productivity"].map((term) => <button key={term} onClick={() => { setQuery(""); chooseCategory(term, true); }} className={activeCategory === term ? "suggestion-active" : ""}>{term}</button>)}</div>
          <div className="hero-shortcuts mx-auto mt-9 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => <button key={category.name} onClick={() => chooseCategory(category.name, true)} className={`shortcut-card shortcut-${category.tint} ${activeCategory === category.name ? "shortcut-active" : ""}`} aria-pressed={activeCategory === category.name}>
              <span className="shortcut-icon">{category.icon}</span><span className="shortcut-name">{category.name}</span><span className="shortcut-count">{category.count} tools <span aria-hidden="true">↗</span></span>
            </button>)}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-7 px-5 pb-16 sm:px-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
        <aside className="category-sidebar hidden lg:block" aria-label="Tool categories">
          <div className="sidebar-inner"><p className="sidebar-heading">DISCOVER</p>
            <button className={`sidebar-item ${activeCategory === "All tools" ? "sidebar-item-active" : ""}`} onClick={() => chooseCategory("All tools", true)} aria-pressed={activeCategory === "All tools"}><span>✳</span><span>All tools</span><small>{tools.length}</small></button>
            {categories.map((category) => <button key={category.name} className={`sidebar-item ${activeCategory === category.name ? "sidebar-item-active" : ""}`} onClick={() => chooseCategory(category.name, true)} aria-pressed={activeCategory === category.name}><span>{category.icon}</span><span>{category.name}</span><small>{category.count}</small></button>)}
            <div className="sidebar-note"><span>✦ A little inspiration</span><p>Small tools can unlock big ideas. Explore until something clicks.</p></div>
          </div>
        </aside>

        <div className="min-w-0">
          <section id="featured" className="featured-section pt-1">
            <div className="section-topline"><div><p className="light-kicker">A GOOD PLACE TO START</p><h2>Featured tools<span>.</span></h2><p>Handy little helpers for your next big thing.</p></div><a href="#tools" className="section-text-link">Browse all tools <span aria-hidden="true">→</span></a></div>
            <div className="featured-window mt-6" aria-label="Featured tools scrolling carousel">
              <div className="featured-track">
                {[...featured, ...featured].map((tool, index) => <Link key={tool.slug + "-" + index} href={tool.href} tabIndex={index >= featured.length ? -1 : undefined} aria-hidden={index >= featured.length ? true : undefined} className={`featured-card featured-${tool.tone}`}>
                  <span className="featured-art" aria-hidden="true"><span>{tool.icon}</span><i /><i /></span>
                  <span className="featured-card-content"><span className="featured-category">{tool.category}</span><strong>{tool.name}</strong><span className="featured-description">{tool.description}</span><span className="featured-open">Explore tool <span aria-hidden="true">↗</span></span></span>
                </Link>)}
              </div>
            </div>
          </section>

          <section id="categories" className="light-categories-section mt-14 scroll-mt-24">
            <div className="section-topline"><div><p className="light-kicker">FIND YOUR FLOW</p><h2>Explore by category<span>.</span></h2><p>Choose a lane, or follow your curiosity.</p></div></div>
            <div className="light-category-grid mt-5">
              {categories.map((category) => <button key={category.name} onClick={() => chooseCategory(category.name, true)} aria-pressed={activeCategory === category.name} className={`light-category-card cat-${category.tint} ${activeCategory === category.name ? "light-category-active" : ""}`}>
                <span className="light-category-icon">{category.icon}</span><span className="light-category-name">{category.name}</span><span className="light-category-description">{category.subtitle}</span><span className="light-category-count">{category.count} tools <span aria-hidden="true">↗</span></span>
              </button>)}
            </div>
          </section>

          <section id="tools" className="light-tools-section mt-16 scroll-mt-24">
            <div className="section-topline"><div><p className="light-kicker">THE TOOL DIRECTORY</p><h2>Find your next shortcut<span>.</span></h2><p>Explore the catalog with search and category filters.</p></div><span className="light-result-count" aria-live="polite">{visibleTools.length} {visibleTools.length === 1 ? "tool" : "tools"} found</span></div>
            <div className="mobile-category-strip mt-5" aria-label="Filter by category">
              <button onClick={() => chooseCategory("All tools")} aria-pressed={activeCategory === "All tools"} className={activeCategory === "All tools" ? "mobile-chip active" : "mobile-chip"}>All tools</button>
              {categories.map((category) => <button key={category.name} onClick={() => chooseCategory(category.name)} aria-pressed={activeCategory === category.name} className={activeCategory === category.name ? "mobile-chip active" : "mobile-chip"}>{category.name}</button>)}
            </div>
            <div className="light-tool-grid mt-6">
              {visibleTools.map((tool) => <article key={tool.slug} className="light-tool-card">
                <div className="light-tool-card-top"><span className={`light-tool-icon tool-tone-${tool.tone}`}>{tool.icon}</span><span className="light-tool-status"><i /> Ready to use</span></div>
                <p className="light-tool-category">{tool.category}</p><h3>{tool.name}</h3><p className="light-tool-description">{tool.description}</p>
                <div className="light-tool-footer"><span>Browser-friendly utility</span><Link href={tool.href} aria-label={`Open ${tool.name}`}>Explore <span aria-hidden="true">↗</span></Link></div>
              </article>)}
            </div>
            {visibleTools.length === 0 && <div className="light-empty-state"><span>⌕</span><h3>No tools found for that search</h3><p>Try another keyword or reset the filters to explore the full directory.</p><button onClick={resetFilters}>Clear search and filters</button></div>}
            {(query || activeCategory !== "All tools") && <button onClick={resetFilters} className="reset-filters">Clear search and filters ×</button>}
          </section>
        </div>
      </div>

      <section id="about" className="light-about px-5 py-16 sm:px-8 sm:py-20"><div className="light-about-inner mx-auto max-w-5xl text-center"><div className="light-eyebrow mx-auto">MADE FOR WHAT'S NEXT</div><h2 className="mt-5">Better tools. More room <span>to create.</span></h2><p className="mx-auto mt-4 max-w-2xl">AIToolss brings useful, approachable browser tools together in one place—so you can spend less time hunting and more time doing.</p><a href="#tools" className="light-about-cta mt-7 inline-flex">Find your next tool <span aria-hidden="true">↗</span></a></div></section>
      <footer className="light-footer px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><Link href="/" aria-label="AIToolss home" className="light-brand"><span className="light-brand-mark">A</span><span>AIToolss<span className="brand-period">.</span></span></Link><p>Useful tools for curious minds.</p><nav aria-label="Footer links" className="flex flex-wrap gap-4 text-sm"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/admin-login">Admin</Link><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram ↗</a></nav><span className="text-sm">© {new Date().getFullYear()} AIToolss</span></div></footer>
      {showTop && <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} aria-label="Back to top" title="Back to top">↑</button>}
    </main>
  );
}
