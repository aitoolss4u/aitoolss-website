"use client";

import Link from "next/link";
import PublicSidebar from "@/components/public-sidebar";
import PublicFooter from "@/components/public-footer";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
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

function normalizeSearchText(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

function scoreToolMatch(tool: (typeof tools)[number], normalizedQuery: string) {
  const name = normalizeSearchText(tool.name);
  const slug = normalizeSearchText(tool.slug.replace(/-/g, " "));
  const category = normalizeSearchText(tool.category);
  const description = normalizeSearchText(tool.description);
  const tags = tool.tags.map(normalizeSearchText);
  const searchable = [name, slug, category, description, ...tags].join(" ");
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  if (name === normalizedQuery) return 1000;
  if (name.startsWith(normalizedQuery)) return 900;
  if (name.split(" ").some((token) => token.startsWith(normalizedQuery))) return 800;
  if (name.includes(normalizedQuery)) return 700;
  if (slug.startsWith(normalizedQuery)) return 650;
  if (slug.includes(normalizedQuery)) return 600;
  if (tags.some((tag) => tag === normalizedQuery)) return 550;
  if (tags.some((tag) => tag.startsWith(normalizedQuery))) return 500;
  if (category === normalizedQuery) return 450;
  if (category.startsWith(normalizedQuery)) return 400;
  if (tags.some((tag) => tag.includes(normalizedQuery))) return 350;
  if (category.includes(normalizedQuery)) return 300;
  if (description.includes(normalizedQuery)) return 200;
  if (queryTokens.length > 1 && queryTokens.every((token) => searchable.includes(token))) return 100;
  return 0;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [categoryNames, setCategoryNames] = useState<string[]>(toolCategories);
  const [showTop, setShowTop] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const featuredWindowRef = useRef<HTMLDivElement>(null);
  const [featuredInView, setFeaturedInView] = useState(false);
  const [gallery, setGallery] = useState<Array<{id:string;type:"image"|"video";title:string;description:string;url:string;thumbnail_url:string|null;creator:string|null}>>([]);
  const [galleryColumns, setGalleryColumns] = useState(4);
  const [popular, setPopular] = useState<string[]>([]);
  const categories = useMemo(() => categoryNames.map((name) => {
    const meta = categoryMeta.find((category) => category.name === name);
    return { name, icon: meta?.icon ?? name.slice(0, 1), tint: meta?.tint ?? "lilac", subtitle: meta?.subtitle ?? "Explore useful tools", count: tools.filter((tool) => tool.category === name).length };
  }), [categoryNames]);
  const searchSuggestions = useMemo(() => {
    const normalized = normalizeSearchText(query);
    const categoryTools = activeCategory ? tools.filter((tool) => tool.category === activeCategory) : tools;
    if (!normalized) return activeCategory ? categoryTools.slice(0, 8) : [];
    return categoryTools
      .map((tool) => ({ tool, score: scoreToolMatch(tool, normalized) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
      .slice(0, 8)
      .map((result) => result.tool);
  }, [query, activeCategory]);
  const isSuggestionsVisible = suggestionsOpen && (Boolean(query.trim()) || Boolean(activeCategory));
  const featured = useMemo(() => featuredSlugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof tools)[number] => Boolean(tool)), []);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.ok ? r.json() : { categories: toolCategories }).then((data) => { const names = Array.isArray(data.categories) ? data.categories.filter((name: unknown): name is string => typeof name === "string" && toolCategories.includes(name)) : []; setCategoryNames(names.length === 8 ? names : toolCategories); const requestedCategory = new URLSearchParams(window.location.search).get("category"); if (requestedCategory && toolCategories.includes(requestedCategory)) { setActiveCategory(requestedCategory); setSuggestionsOpen(true); setActiveSuggestionIndex(0); } }).catch(() => { setCategoryNames(toolCategories); const requestedCategory = new URLSearchParams(window.location.search).get("category"); if (requestedCategory && toolCategories.includes(requestedCategory)) { setActiveCategory(requestedCategory); setSuggestionsOpen(true); setActiveSuggestionIndex(0); } });
    fetch("/api/gallery").then((r) => r.ok ? r.json() : { items: [] }).then((data) => { setGallery(Array.isArray(data.items) ? data.items : []); setGalleryColumns([4,5,6].includes(data.columns) ? data.columns : 4); }).catch(() => setGallery([]));
    fetch("/api/popular-tools").then((r) => r.ok ? r.json() : { slugs: [] }).then((data) => setPopular(Array.isArray(data.slugs) ? data.slugs : [])).catch(() => setPopular([]));
  }, []);

  useEffect(() => {
    const node = featuredWindowRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setFeaturedInView(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function chooseCategory(category: string, focusSearch = false) {
    setActiveCategory(category);
    setQuery("");
    setSuggestionsOpen(true);
    setActiveSuggestionIndex(0);
    if (focusSearch) searchInputRef.current?.focus();
  }
  function openSuggestedTool(tool: (typeof tools)[number]) {
    recordToolSelection(tool.slug);
    setSuggestionsOpen(false);
    window.location.assign(tool.href);
  }
  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }
    if (event.key === "ArrowDown" && searchSuggestions.length) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestionIndex((current) => current < 0 ? 0 : Math.min(current + 1, searchSuggestions.length - 1));
      return;
    }
    if (event.key === "ArrowUp" && searchSuggestions.length) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestionIndex((current) => current <= 0 ? searchSuggestions.length - 1 : current - 1);
      return;
    }
    if (event.key === "Enter" && isSuggestionsVisible && searchSuggestions.length) {
      event.preventDefault();
      openSuggestedTool(searchSuggestions[Math.max(0, activeSuggestionIndex)] ?? searchSuggestions[0]);
    }
  }
  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchSuggestions.length) {
      openSuggestedTool(searchSuggestions[Math.max(0, activeSuggestionIndex)] ?? searchSuggestions[0]);
    } else if (query.trim()) {
      setSuggestionsOpen(true);
    }
  }
  function recordToolSelection(slug: string) { fetch("/api/popular-tools", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }) }).catch(() => undefined); }
  const popularTools = useMemo(() => { const ranked = popular.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is (typeof tools)[number] => Boolean(tool)); return [...ranked, ...tools.filter((tool) => !ranked.some((item) => item.slug === tool.slug))].slice(0, 8); }, [popular]);


  return (
    <div className="light-shell min-h-screen"><main className="app-layout">
      <div className="homepage-layout">
        <PublicSidebar categories={categories} activeCategory={activeCategory} onCategoryChange={(category) => chooseCategory(category, true)} />

        <div className="homepage-main min-w-0">
      <section className="light-hero relative px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div aria-hidden="true" className="hero-orb hero-orb-one" /><div aria-hidden="true" className="hero-orb hero-orb-two" />
        <div className="hero-content relative z-10 w-full text-center">
          <div className="light-eyebrow mx-auto"><span className="eyebrow-spark">✳</span> YOUR FRIENDLY AI TOOLKIT</div>
          <h1 className="light-hero-title mx-auto mt-6">Your Entire <span>AI Universe.</span></h1>
          <p className="light-hero-copy mx-auto mt-5 max-w-2xl">Discover useful tools for creativity, productivity, coding, research and everyday work. Find your spark, then make it happen.</p>
          <form id="search" role="search" onSubmit={handleSearchSubmit} className="light-search-wrap mx-auto mt-8">
            <div className="light-search">
              <span aria-hidden="true" className="search-glyph">⌕</span>
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Search AI tools"
                aria-autocomplete="list"
                aria-controls="tool-search-suggestions"
                aria-expanded={isSuggestionsVisible}
                aria-activedescendant={isSuggestionsVisible && searchSuggestions[activeSuggestionIndex] ? `tool-suggestion-${searchSuggestions[activeSuggestionIndex].slug}` : undefined}
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setQuery(nextQuery);
                  setActiveCategory("");
                  setSuggestionsOpen(Boolean(nextQuery.trim()));
                  setActiveSuggestionIndex(nextQuery.trim() ? 0 : -1);
                }}
                onFocus={() => { if (query.trim() || activeCategory) setSuggestionsOpen(true); }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tools, ideas, or what you want to do…"
              />
              {query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setQuery(""); setActiveCategory(""); setSuggestionsOpen(false); setActiveSuggestionIndex(-1); searchInputRef.current?.focus(); }}>×</button>}
              <span className="search-sparkle" aria-hidden="true">✦</span>
              <button type="submit" className="light-search-submit">Discover <span aria-hidden="true">→</span></button>
            </div>
            {isSuggestionsVisible && <div id="tool-search-suggestions" role="listbox" aria-label="Tool suggestions" className="search-suggestions-panel">
              {searchSuggestions.length ? <>
                <div className="search-suggestions-heading">{query.trim() ? `Suggestions for “${query.trim()}”` : `Explore ${activeCategory} tools`} <span>{searchSuggestions.length} results</span></div>
                {searchSuggestions.map((tool, index) => <button
                  type="button"
                  role="option"
                  id={`tool-suggestion-${tool.slug}`}
                  key={tool.slug}
                  aria-selected={index === activeSuggestionIndex}
                  className={`search-suggestion-option ${index === activeSuggestionIndex ? "search-suggestion-active" : ""}`}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                  onClick={() => openSuggestedTool(tool)}
                >
                  <span className={`search-suggestion-icon tool-tone-${tool.tone}`} aria-hidden="true">{tool.icon}</span>
                  <span className="search-suggestion-copy"><strong>{tool.name}</strong><small>{tool.category} · {tool.description}</small></span>
                  <span className="search-suggestion-arrow" aria-hidden="true">↗</span>
                </button>)}
              </> : <div className="search-no-results">No matching tools found</div>}
            </div>}
          </form>

          <div className="hero-shortcuts mx-auto mt-9 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {categories.map((category) => <button key={category.name} onClick={() => chooseCategory(category.name, true)} className={`shortcut-card shortcut-${category.tint} ${activeCategory === category.name ? "shortcut-active" : ""}`} aria-pressed={activeCategory === category.name}>
              <span className="shortcut-icon">{category.icon}</span><span className="shortcut-name">{category.name}</span><span className="shortcut-count">{category.count} tools <span aria-hidden="true">↗</span></span>
            </button>)}
          </div>
        </div>
      </section>


          <section id="featured" className="featured-section pt-1">
            <div className="section-topline"><div><p className="light-kicker">A GOOD PLACE TO START</p><h2>Featured tools<span>.</span></h2><p>Handy little helpers for your next big thing.</p></div></div>
            <div ref={featuredWindowRef} className="featured-window mt-6" role="region" aria-label="Featured tools scrolling carousel">
              <div className={`featured-track ${featuredInView ? "featured-track-active" : ""}`}>
                <div className="featured-marquee-group">
                {featured.map((tool) => <Link key={`${tool.slug}`} href={tool.href} tabIndex={undefined} className={`featured-card featured-${tool.tone}`} onClick={() => recordToolSelection(tool.slug)}>
                  <span className={`featured-art featured-art-${tool.category.toLowerCase()}`} aria-hidden="true"><span>{tool.icon}</span><i /><i /></span>
                  <span className="featured-card-content"><span className="featured-category">{tool.category}</span><strong>{tool.name}</strong><span className="featured-description">{tool.description}</span><span className="featured-open">Explore tool <span aria-hidden="true">↗</span></span></span>
                </Link>)}
              </div>
                <div className="featured-marquee-group" aria-hidden="true">
                {featured.map((tool) => <Link key={`duplicate-${tool.slug}`} href={tool.href} tabIndex={-1} aria-hidden="true" className={`featured-card featured-${tool.tone}`} onClick={() => recordToolSelection(tool.slug)}>
                  <span className={`featured-art featured-art-${tool.category.toLowerCase()}`} aria-hidden="true"><span>{tool.icon}</span><i /><i /></span>
                  <span className="featured-card-content"><span className="featured-category">{tool.category}</span><strong>{tool.name}</strong><span className="featured-description">{tool.description}</span><span className="featured-open">Explore tool <span aria-hidden="true">↗</span></span></span>
                </Link>)}
              </div>
              </div>
            </div>
          </section>

          <section id="gallery" className="gallery-section mt-14 scroll-mt-24"><div className="section-topline"><div><p className="light-kicker">MADE WITH AI</p><h2>AI Creations Gallery<span>.</span></h2><p>Explore inspiring AI-generated visuals and videos from the creative community.</p></div></div>{gallery.length ? <div className="ai-gallery-grid mt-6" style={{ "--gallery-columns": galleryColumns } as React.CSSProperties}>{gallery.map((item) => item.type === "image" ? (
            <a key={item.id} className="ai-gallery-card ai-gallery-card-linked" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${item.title || "AI image"}`}>
              <div className="gallery-media"><img src={item.thumbnail_url || item.url} alt={item.title || "AI creation"} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; const parent = event.currentTarget.parentElement; if (parent && !parent.querySelector(".media-fallback")) { const fallback = document.createElement("span"); fallback.className = "media-fallback"; fallback.textContent = "Preview unavailable"; parent.appendChild(fallback); } }} /></div>
              <div className="gallery-caption"><strong>{item.title || "AI creation"}</strong>{item.description && <p>{item.description}</p>}{item.creator && <small>By {item.creator}</small>}<span className="gallery-card-open">View creation ↗</span></div>
            </a>
          ) : (
            <article key={item.id} className="ai-gallery-card ai-gallery-video-card">
              <a className="gallery-video-card-hit-area" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Open video: ${item.title || "AI creation"}`}>Open video: {item.title || "AI creation"}</a>
              <div className="gallery-media"><video src={item.url} poster={item.thumbnail_url || undefined} controls preload="none" aria-label={item.title || "AI-generated video"} onError={(event) => { event.currentTarget.style.display = "none"; const parent = event.currentTarget.parentElement; if (parent && !parent.querySelector(".media-fallback")) { const fallback = document.createElement("span"); fallback.className = "media-fallback"; fallback.textContent = "Video preview unavailable"; parent.appendChild(fallback); } }} /><span className="gallery-type">▶ VIDEO</span></div>
              <div className="gallery-caption gallery-video-caption"><strong>{item.title || "AI creation"}</strong>{item.description && <p>{item.description}</p>}{item.creator && <small>By {item.creator}</small>}<a className="gallery-card-open" href={item.url} target="_blank" rel="noopener noreferrer">Open video ↗</a></div>
            </article>
          ))}</div> : <div className="gallery-empty mt-6"><span aria-hidden="true">✧</span><h3>Creative work is on its way</h3><p>Published AI images and videos will appear here when an administrator adds them.</p></div>}</section>
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

        </div>
      </div>

      </main>
      <PublicFooter categories={categories} onCategoryChange={(category) => chooseCategory(category, true)} />
      {showTop && <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} aria-label="Back to top" title="Back to top">↑</button>}
    </div>
  );
}
