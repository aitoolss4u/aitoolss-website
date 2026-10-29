"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function summarize(source: string, limit: number) {
  const sentences = (source.match(/[^.!?]+[.!?]+|[^.!?]+$/gu) ?? []).map((part) => part.trim()).filter(Boolean);
  if (sentences.length <= limit) return sentences.join(" ");
  const ignored = new Set("a an the and or but if then than to of in on at for from by with as is are was were be been it its this that these those you your we our they their not can could would should will".split(" "));
  const frequency = new Map<string, number>();
  for (const word of source.toLowerCase().match(/[a-z0-9']+/gu) ?? []) {
    if (word.length > 2 && !ignored.has(word)) frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }
  return sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-z0-9']+/gu) ?? [];
    return { sentence, index, score: words.reduce((sum, word) => sum + (frequency.get(word) ?? 0), 0) / Math.max(1, words.length) };
  }).sort((a, b) => b.score - a.score).slice(0, limit).sort((a, b) => a.index - b.index).map((item) => item.sentence).join(" ");
}

export default function TextSummarizerPage() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState(3);
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => summarize(text, limit), [text, limit]);
  async function copySummary() {
    try { await navigator.clipboard.writeText(output); setCopied(true); } catch { setCopied(false); }
  }
  const wordCount = text.trim() ? text.trim().split(/\s+/u).length : 0;
  return <main className="tool-page-shell">
    
    <section className="tool-page-content"><p className="section-kicker">FREE WRITING TOOL</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">Text Summarizer<span className="heading-period">.</span></h1><p className="section-description mt-4 max-w-2xl leading-7">Turn long text into a shorter overview. This extractive summarizer runs locally in your browser; your text is not uploaded.</p>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="ds-panel p-4 sm:p-5"><label htmlFor="source-text" className="mb-3 block text-sm font-bold">Paste your text</label><textarea id="source-text" value={text} onChange={(e) => { setText(e.target.value); setCopied(false); }} rows={15} placeholder="Paste an article, notes, or a long passage…" className="w-full rounded-xl border border-white/10 bg-black/20 p-4 leading-7 outline-none focus:border-violet-400"/><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted">{wordCount} words</span><button onClick={() => setText("")} className="rounded-full border border-white/15 px-4 py-2 text-sm">Clear</button></div></div>
        <div className="ds-panel p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Summary</h2><label className="text-sm text-muted">Sentences <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="ml-2 rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-foreground"><option value={2}>2</option><option value={3}>3</option><option value={5}>5</option><option value={8}>8</option></select></label></div><div aria-live="polite" className="mt-4 min-h-64 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7">{output || "Your summary will appear here after you paste some text."}</div><button disabled={!output} onClick={() => void copySummary()} className="search-button mt-4 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50">{copied ? "Copied!" : "Copy summary"}</button><p className="mt-4 text-xs leading-5 text-muted">This tool selects representative sentences by word frequency. It is not a generative AI model; review summaries for missing context.</p></div>
      </div>
    </section>
  </main>;
}
