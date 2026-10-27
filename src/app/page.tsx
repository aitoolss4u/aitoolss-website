"use client";

import { useMemo, useState } from "react";

const categories = [
  { name: "All tools", icon: "✳", count: 60 },
  { name: "Writing", icon: "✍", count: 12 },
  { name: "Images", icon: "✦", count: 10 },
  { name: "Productivity", icon: "⚡", count: 9 },
  { name: "Coding", icon: "⌘", count: 8 },
  { name: "Marketing", icon: "↗", count: 7 },
  { name: "Education", icon: "▣", count: 6 },
  { name: "Business", icon: "◇", count: 5 },
  { name: "Career", icon: "▤", count: 3 },
];

const tools = [
  { name: "Text Summarizer", category: "Writing", icon: "≡", description: "Turn long text into clear, concise summaries.", label: "BROWSER TOOL", href: "/tools/text-summarizer" },
  { name: "Word Counter", category: "Writing", icon: "Aa", description: "Count words, characters and reading time.", label: "UTILITY", href: "/tools/word-counter" },
  { name: "Image Compressor", category: "Images", icon: "▧", description: "Make image files smaller for faster sharing.", label: "UTILITY", href: "/tools/image-compressor" },
  { name: "Prompt Generator", category: "Productivity", icon: "✳", description: "Shape a clearer prompt for your next AI task.", label: "COMING SOON", href: "/tools/prompt-generator" },
  { name: "Code Explainer", category: "Coding", icon: "{ }", description: "A planned helper for understanding code snippets.", label: "COMING SOON", href: "/tools/code-explainer" },
  { name: "Video Description", category: "Marketing", icon: "▷", description: "Prepare structured descriptions for your videos.", label: "COMING SOON", href: "/tools/video-description" },
  { name: "Study Notes", category: "Education", icon: "▤", description: "Organize study material into readable notes.", label: "COMING SOON", href: "/tools/study-notes" },
  { name: "Business Name Ideas", category: "Business", icon: "◇", description: "Explore naming directions for a new idea.", label: "COMING SOON", href: "/tools/business-name-ideas" },
  { name: "Resume Checklist", category: "Career", icon: "▣", description: "Review the essentials of a professional resume.", label: "COMING SOON", href: "/tools/resume-checklist" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All tools");

  const visibleTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatches = activeCategory === "All tools" || tool.category === activeCategory;
      const queryMatches = !normalized || [tool.name, tool.category, tool.description].join(" ").toLowerCase().includes(normalized);
      return categoryMatches && queryMatches;
    });
  }, [query, activeCategory]);

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-20 border-b border-white/[.08] bg-[#0b1020]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" aria-label="AIToolss home" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#7657ff] to-[#35d9ff] text-lg font-black">A</span>
            <span className="text-xl font-bold tracking-tight">AITools<span className="text-[#35d9ff]">s</span><span className="text-[#7657ff]">.</span></span>
          </a>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a className="transition hover:text-[#35d9ff]" href="#tools">Explore tools</a>
            <a className="transition hover:text-[#35d9ff]" href="#categories">Categories</a>
            <a className="transition hover:text-[#35d9ff]" href="#about">About</a>
          </nav>
          <a href="#tools" className="rounded-xl border border-[#7657ff]/50 bg-[#7657ff]/10 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-[#7657ff]/20">Explore tools ↗</a>
        </div>
      </header>

      <section className="relative px-5 pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-96 w-[min(90vw,700px)] -translate-x-1/2 rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/[.08] px-4 py-2 text-xs font-medium tracking-wide text-violet-100 sm:text-sm"><span className="h-2 w-2 rounded-full bg-[#35d9ff]" /> YOUR NEXT FAVORITE AI TOOL STARTS HERE</p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">Find the right AI tool.<br /><span className="bg-gradient-to-r from-[#a78bfa] via-[#c4b5fd] to-[#35d9ff] bg-clip-text text-transparent">Do more with less.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Discover useful tools for writing, creativity, productivity and more. One simple place to find your next great tool.</p>
          <form onSubmit={(event) => { event.preventDefault(); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} role="search" className="mx-auto mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-[#111829] p-2 shadow-2xl shadow-violet-950/30 focus-within:border-violet-400/60">
            <span aria-hidden="true" className="pl-3 text-xl text-slate-400">⌕</span>
            <input aria-label="Search AI tools" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools, tasks or categories…" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:text-base" />
            <button type="submit" className="rounded-xl bg-[#7657ff] px-4 py-3 text-sm font-semibold transition hover:bg-violet-400 sm:px-6">Search</button>
          </form>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 sm:text-sm"><span>Popular:</span>{["Writing", "Images", "Coding", "Productivity"].map((item) => <button key={item} onClick={() => { setActiveCategory(item); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-violet-400/50 hover:text-violet-200">{item}</button>)}</div>
          <div className="mt-14 grid grid-cols-3 border-t border-white/[.08] pt-7">
            <div><p className="text-2xl font-bold sm:text-3xl">60<span className="text-violet-400">+</span></p><p className="mt-1 text-xs text-slate-500 sm:text-sm">Tools on the roadmap</p></div>
            <div className="border-x border-white/[.08]"><p className="text-2xl font-bold sm:text-3xl">8</p><p className="mt-1 text-xs text-slate-500 sm:text-sm">Core categories</p></div>
            <div><p className="text-2xl font-bold sm:text-3xl">Free<span className="text-[#35d9ff]">.</span></p><p className="mt-1 text-xs text-slate-500 sm:text-sm">Discover with ease</p></div>
          </div>
        </div>
      </section>

      <section id="categories" className="scroll-mt-24 border-y border-white/[.07] bg-white/[.015] px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#35d9ff]">Browse by interest</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Explore categories</h2>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => <button key={category.name} onClick={() => { setActiveCategory(category.name); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }} aria-pressed={activeCategory === category.name} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${activeCategory === category.name ? "border-violet-400/60 bg-violet-500/15" : "border-white/[.08] bg-[#101625] hover:border-violet-400/30"}`}><span className="text-2xl text-violet-200">{category.icon}</span><span className="mt-4 flex items-center justify-between gap-2"><span className="text-sm font-semibold">{category.name}</span><span className="text-xs text-slate-500">{category.count}</span></span></button>)}
          </div>
        </div>
      </section>

      <section id="tools" className="scroll-mt-24 px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">The discovery hub</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Discover useful tools</h2><p className="mt-3 text-sm text-slate-400">A growing collection. Tools marked “Coming soon” are not live yet.</p></div><span className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm text-slate-400">{visibleTools.length} shown</span></div>
          <div className="mt-7 flex flex-wrap gap-2">{categories.map((category) => <button key={category.name} onClick={() => setActiveCategory(category.name)} aria-pressed={activeCategory === category.name} className={`rounded-full px-4 py-2 text-sm transition ${activeCategory === category.name ? "bg-[#7657ff] text-white" : "border border-white/10 text-slate-400 hover:border-white/25 hover:text-white"}`}>{category.name}</button>)}</div>
          {visibleTools.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleTools.map((tool) => <article key={tool.name} className="group rounded-2xl border border-white/[.09] bg-[#101625] p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-[#131b2d]"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl border border-white/[.07] bg-white/[.04] text-xl text-violet-200">{tool.icon}</span><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-400">{tool.label}</span></div><p className="mt-5 text-xs font-medium text-violet-300">{tool.category}</p><h3 className="mt-2 text-lg font-semibold group-hover:text-cyan-200">{tool.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{tool.description}</p><span className="mt-5 flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300"><span>{tool.label === "COMING SOON" ? "Planned tool" : "In the tool roadmap"}</span><span className="text-[#35d9ff]">↗</span></span></article>)}</div> : <div className="mt-8 rounded-2xl border border-white/10 p-10 text-center"><p className="text-lg font-semibold">No matching tools found</p><p className="mt-2 text-sm text-slate-400">Try another search or category.</p><button onClick={() => { setQuery(""); setActiveCategory("All tools"); }} className="mt-4 rounded-xl bg-[#7657ff] px-5 py-2.5 text-sm font-semibold">Clear filters</button></div>}
        </div>
      </section>

      <section id="about" className="scroll-mt-24 px-5 pb-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/15 via-[#101625] to-cyan-400/[.07] px-6 py-12 text-center sm:px-12 sm:py-16"><p className="text-sm font-semibold text-[#35d9ff]">BUILT FOR CURIOUS MINDS</p><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">Spend less time searching. More time creating.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">AIToolss is being built to make discovering helpful tools simple, clear and accessible.</p><a href="#tools" className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0b1020] transition hover:bg-cyan-100">Explore the directory →</a></div>
      </section>

      <footer className="border-t border-white/[.08] px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"><a href="/" className="text-lg font-bold">AIToolss<span className="text-[#35d9ff]">.</span></a><p className="text-xs text-slate-500">Discover tools. Unlock possibilities.</p><p className="text-xs text-slate-500">© 2026 AIToolss</p></div></footer>
    </main>
  );
}
