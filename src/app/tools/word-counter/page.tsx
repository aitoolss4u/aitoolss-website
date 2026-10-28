"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/u).length : 0;
    return {
      words,
      characters: text.length,
      noSpaces: text.replace(/\s/gu, "").length,
      readingMinutes: words ? Math.max(1, Math.ceil(words / 200)) : 0,
    };
  }, [text]);

  return (
    <main className="site-shell min-h-screen px-5 pb-16">
      <header className="mx-auto flex max-w-6xl items-center justify-between py-6">
        <Link href="/" className="text-xl font-extrabold">AIToolss<span className="brand-dot">.</span></Link>
        <Link href="/#tools" className="nav-link text-sm">← All tools</Link>
      </header>
      <section className="mx-auto max-w-5xl pt-10">
        <p className="section-kicker">FREE WRITING TOOL</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">Word Counter<span className="heading-period">.</span></h1>
        <p className="section-description mt-4 leading-7">Count words and characters instantly and estimate reading time. Your text stays in this browser.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Words", stats.words], ["Characters", stats.characters], ["No spaces", stats.noSpaces], ["Reading time", stats.readingMinutes + " min"]].map(([label, value]) => (
            <div key={label} className="ds-panel p-5"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>
          ))}
        </div>
        <div className="ds-panel mt-5 p-4 sm:p-5">
          <label htmlFor="word-text" className="mb-3 block text-sm font-bold">Your text</label>
          <textarea id="word-text" value={text} onChange={(event) => setText(event.target.value)} rows={14} placeholder="Paste or type your text here…" className="w-full rounded-xl border border-white/10 bg-black/20 p-4 leading-7 outline-none focus:border-violet-400" />
          <div className="mt-3 flex justify-between text-xs text-muted"><span>Estimated at 200 words per minute</span><button type="button" onClick={() => setText("")} className="rounded-full border border-white/15 px-4 py-2 text-sm text-foreground">Clear text</button></div>
        </div>
      </section>
    </main>
  );
}
