"use client";

import Link from "next/link";
import PublicSidebar from "@/components/public-sidebar";
import PublicFooter from "@/components/public-footer";
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
];

const featuredSlugs = ["prompt-generator", "word-counter", "image-compressor", "json-formatter", "color-palette-builder", "text-summarizer", "password-generator", "markdown-formatter"];
const categoryVisuals: Record<string, string> = { Writing: "✍", Images: "🎨", Productivity: "⚡", Coding: "⌘", Marketing: "↗", Education: "▤", Business: "◇", Career: "✦" };

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All tools");
  const [categoryNames, setCategoryNames] = useState<string[]>(toolCategories);
  const [showTop, setShowTop] = useState(false);
  const [gallery, setGallery] = useState<Array<{id:string;type:"image"|"video";title:string;description:string;url:string;thumbnail_url:string|null;creator:string|null}>>([]);
  const [galleryColumns, setGalleryColumns] = useState(4);
  const [popular, setPopular] = useState<string[]>([]);
  const categories = useMemo(() => categoryNames.map((name) => {
    const meta = categoryMeta.find((category) => category.name === name);
    return { name, icon: meta?.icon ?? name.slice(0, 1), tint: meta?.tint ?? "lilac", subtitle: meta?.subtitle ?? "Explore useful tools", count: tools.filter((tool) => tool.category === name).length };
  }), [categoryNames]);
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
    fetch("/api/categories").then((r) => r.ok ? r.json() : { categories: toolCategories }).then((data) => { if (Array.isArray(data.categories) && data.categories.every((name: unknown) => typeof name === "string")) setCategoryNames(data.categories); }).catch(() => setCategoryNames(toolCategories));
    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    if (requestedCategory && toolCategories.includes(requestedCategory)) setActiveCategory(requestedCategory);
    fetch("/api/gallery").then((r) => r.ok ? r.json() : { items: [] }).then((data) => { setGallery(Array.isArray(data.items) ? data.items : []); setGalleryColumns([4,5,6].includes(data.columns) ? data.columns : 4); }).catch(() => setGallery([]));
    fetch("/api/popular-tools").then((r) => r.ok ? r.json() : { slugs: [] }).then((data) => setPopular(Array.isArray(data.slugs) ? data.slugs : [])).catch(() => setPopular([]));
  }, []);

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
  function recordToolSelection(slug: string) { fetch("/api/popular-tools", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }) }).catch(() => undefined); }
  const popularTools = useMemo(() => { const ranked = popular.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof tools)[number] => Boolean(tool)); return [...ranked, ...tools.filter((tool) => !ranked.some((item) => item.slug === tool.slug))].slice(0, 8); }, [popular]);

  function resetFilters() {
    setQuery("");
    chooseCategory("All tools");
  }

  return (
    <main className="light-shell min-h-screen"><div className="app-layout">
      <div className="homepage-layout">
        <PublicSidebar categories={categories} activeCategory={activeCategory} onCategoryChange={(category) => chooseCategory(category, true)} />

        <div className="homepage-main min-w-0">
      <section className="light-hero relative overflow-hidden px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div aria-hidden="true" className="hero-orb hero-orb-one" /><div aria-hidden="true" className="hero-orb hero-orb-two" />
        <div className="hero-content relative z-10 w-full text-center">
          <div className="light-eyebrow mx-auto"><span className="eyebrow-spark">✳</span> YOUR FRIENDLY AI TOOLKIT</div>
          <h1 className="light-hero-title mx-auto mt-6">Your Entire <span>AI Universe.</span></h1>
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
          <div className="hero-shortcuts mx-auto mt-9 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {categories.map((category) => <button key={category.name} onClick={() => chooseCategory(category.name, true)} className={`shortcut-card shortcut-${category.tint} ${activeCategory === category.name ? "shortcut-active" : ""}`} aria-pressed={activeCategory === category.name}>
              <span className="shortcut-icon">{category.icon}</span><span className="shortcut-name">{category.name}</span><span className="shortcut-count">{category.count} tools <span aria-hidden="true">↗</span></span>
            </button>)}
          </div>
        </div>
      </section>


          <section id="featured" className="featured-section pt-1">
            <div className="section-topline"><div><p className="light-kicker">A GOOD PLACE TO START</p><h2>Featured tools<span>.</span></h2><p>Handy little helpers for your next big thing.</p></div><a href="#tools" className="section-text-link">Browse all tools <span aria-hidden="true">→</span></a></div>
            <div className="featured-window mt-6" aria-label="Featured tools scrolling carousel">
              <div className="featured-track">
                {[...featured, ...featured].map((tool, index) => <Link key={tool.slug + "-" + index} href={tool.href} tabIndex={index >= featured.length ? -1 : undefined} aria-hidden={index >= featured.length ? true : undefined} className={`featured-card featured-${tool.tone}`} onClick={() => recordToolSelection(tool.slug)}>
                  <span className={`featured-art featured-art-${tool.category.toLowerCase()}`} aria-hidden="true"><span>{tool.icon}</span><i /><i /></span>
                  <span className="featured-card-content"><span className="featured-category">{tool.category}</span><strong>{tool.name}</strong><span className="featured-description">{tool.description}</span><span className="featured-open">Explore tool <span aria-hidden="true">↗</span></span></span>
                </Link>)}
              </div>
            </div>
          </section>

          <section id="gallery" className="gallery-section mt-14 scroll-mt-24"><div className="section-topline"><div><p className="light-kicker">MADE WITH AI</p><h2>AI Creations Gallery<span>.</span></h2><p>Explore inspiring AI-generated visuals and videos from the creative community.</p></div></div>{gallery.length ? <div className="ai-gallery-grid mt-6" style={{ "--gallery-columns": galleryColumns } as React.CSSProperties}>{gallery.map((item) => item.type === "image" ? (
            <a key={item.id} className="ai-gallery-card ai-gallery-card-linked" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${item.title || "AI image"}`}>
              <div className="gallery-media"><img src={item.thumbnail_url || item.url} alt={item.title || "AI creation"} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; const parent = event.currentTarget.parentElement; if (parent && !parent.querySelector(".media-fallback")) { const fallback = document.createElement("span"); fallback.className = "media-fallback"; fallback.textContent = "Preview unavailable"; parent.appendChild(fallback); } }} /></div>
              <div className="gallery-caption"><strong>{item.title || "AI creation"}</strong>{item.description && <p>{item.description}</p>}{item.creator && <small>By {item.creator}</small>}<span className="gallery-card-open">View creation ↗</span></div>
            </a>
          ) : (
            <article key={item.id} className="ai-gallery-card">
              <div className="gallery-media"><video src={item.url} poster={item.thumbnail_url || undefined} controls preload="none" aria-label={item.title || "AI-generated video"} onError={(event) => { event.currentTarget.style.display = "none"; const parent = event.currentTarget.parentElement; if (parent && !parent.querySelector(".media-fallback")) { const fallback = document.createElement("span"); fallback.className = "media-fallback"; fallback.textContent = "Video preview unavailable"; parent.appendChild(fallback); } }} /><span className="gallery-type">▶ VIDEO</span></div>
              <div className="gallery-caption"><strong>{item.title || "AI creation"}</strong>{item.description && <p>{item.description}</p>}{item.creator && <small>By {item.creator}</small>}<a className="gallery-card-open" href={item.url} target="_blank" rel="noopener noreferrer">Open video ↗</a></div>
            </article>
          ))}}</div> : <div className="gallery-empty mt-6"><span aria-hidden="true">✧</span><h3>Creative work is on its way</h3><p>Published AI images and videos will appear here when an administrator adds them.</p></div>}</section>
          <section id="categories" className="light-categories-section mt-14 scroll-mt-24">
            <div className="section-topline"><div><p className="light-kicker">FIND YOUR FLOW</p><h2>Explore by category<span>.</span></h2><p>Choose a lane, or follow your curiosity.</p></div></div>
            <div className="light-category-grid mt-5">
              {categories.map((category) => <button key={category.name} onClick={() => chooseCategory(category.name, true)} aria-pressed={activeCategory === category.name} className={`light-category-card cat-${category.tint} ${activeCategory === category.name ? "light-category-active" : ""}`}>
                <span className={`light-category-icon category-visual category-visual-${category.name.toLowerCase()}`} aria-hidden="true">{categoryVisuals[category.name] ?? category.icon}</span><span className="light-category-name">{category.name}</span><span className="light-category-description">{category.subtitle}</span><span className="light-category-count">{category.count} tools <span aria-hidden="true">↗</span></span>
              </button>)}
            </div>
          </section>

          <section id="popular-tools" className="popular-tools-section mt-14 scroll-mt-24"><div className="section-topline"><div><p className="light-kicker">COMMUNITY SHORTCUTS</p><h2>Find your next shortcut<span>.</span></h2><p>Real tool selections influence this list. Until activity builds up, catalog order is used without fabricated popularity counts.</p></div></div><div className="popular-tool-grid mt-6">{popularTools.map((tool) => <Link key={tool.slug} href={tool.href} className="popular-tool-card" onClick={() => recordToolSelection(tool.slug)}>
              <span className={`popular-tool-art tone-${tool.tone}`} aria-hidden="true">{tool.icon}</span><p>{tool.category}</p><h3>{tool.name}</h3><span className="popular-tool-description">{tool.description}</span><span className="popular-tool-link">Open tool <span aria-hidden="true">↗</span></span>
            </Link>)}</div></section>
          <section id="tools" className="light-tools-section mt-16 scroll-mt-24">
            <div className="section-topline"><div><p className="light-kicker">THE TOOL DIRECTORY</p><h2>All tools<span>.</span></h2><p>Explore the complete catalog with search and category filters.</p></div><span className="light-result-count" aria-live="polite">{visibleTools.length} {visibleTools.length === 1 ? "tool" : "tools"} found</span></div>
            <div className="mobile-category-strip mt-5" aria-label="Filter by category">
              <button onClick={() => chooseCategory("All tools")} aria-pressed={activeCategory === "All tools"} className={activeCategory === "All tools" ? "mobile-chip active" : "mobile-chip"}>All tools</button>
              {categories.map((category) => <button key={category.name} onClick={() => chooseCategory(category.name)} aria-pressed={activeCategory === category.name} className={activeCategory === category.name ? "mobile-chip active" : "mobile-chip"}>{category.name}</button>)}
            </div>
            <div className="light-tool-grid mt-6">
              {visibleTools.map((tool) => <Link key={tool.slug} href={tool.href} className="light-tool-card" onClick={() => recordToolSelection(tool.slug)}>
                <div className="light-tool-card-top"><span className={`light-tool-icon tool-tone-${tool.tone}`}>{tool.icon}</span><span className="light-tool-status"><i /> Ready to use</span></div>
                <p className="light-tool-category">{tool.category}</p><h3>{tool.name}</h3><p className="light-tool-description">{tool.description}</p>
                <div className="light-tool-footer"><span>Browser-friendly utility</span><span className="tool-card-cta">Explore <span aria-hidden="true">↗</span></span></div>
              </Link>)}
            </div>
            {visibleTools.length === 0 && <div className="light-empty-state"><span>⌕</span><h3>No tools found for that search</h3><p>Try another keyword or reset the filters to explore the full directory.</p><button onClick={resetFilters}>Clear search and filters</button></div>}
            {(query || activeCategory !== "All tools") && <button onClick={resetFilters} className="reset-filters">Clear search and filters ×</button>}
          </section>
        </div>
      </div>

      <PublicFooter categories={categories} onCategoryChange={(category) => chooseCategory(category, true)} />
      </div>
      {showTop && <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} aria-label="Back to top" title="Back to top">↑</button>}
    </main>
  );
}
