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
const categoryVisuals: Record<string, string> = { Writing: "✍", Images: "🎨", Productivity: "⚡", Coding: "⌘", Marketing: "↗", Education: "▤", Business: "◇", Career: "✦" };

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All tools");
  const [showTop, setShowTop] = useState(false);
  const [gallery, setGallery] = useState<Array<{id:string;type:"image"|"video";title:string;description:string;url:string;thumbnail_url:string|null;creator:string|null}>>([]);
  const [popular, setPopular] = useState<string[]>([]);
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
    fetch("/api/gallery").then((r) => r.ok ? r.json() : { items: [] }).then((data) => setGallery(Array.isArray(data.items) ? data.items : [])).catch(() => setGallery([]));
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


