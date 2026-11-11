"use client";

import { useState } from "react";

export default function TextSummarizerInterface() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState(3);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function summarize() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    setOutput("");
    setCopied(false);
    try {
      const response = await fetch("/api/tools/ai-generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: "text-summarizer", input: text, option: String(limit) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The AI summarizer could not complete this request.");
      if (typeof data.output !== "string" || !data.output.trim()) throw new Error("The AI model returned an empty summary.");
      setOutput(data.output.trim());
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The summary could not be generated. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Copy failed. Select the summary text and copy it manually.");
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/u).length : 0;

  return (
    <section className="tool-panel">
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="ds-panel p-4 sm:p-5">
          <label htmlFor="source-text" className="mb-3 block text-sm font-bold">Paste your text</label>
          <textarea
            id="source-text"
            value={text}
            onChange={(event) => { setText(event.target.value); setOutput(""); setError(""); setCopied(false); }}
            rows={15}
            maxLength={24000}
            placeholder="Paste an article, notes, or a long passage…"
            className="w-full rounded-xl border border-white/10 bg-black/20 p-4 leading-7 outline-none focus:border-violet-400"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted">{wordCount.toLocaleString()} words · {text.length.toLocaleString()} / 24,000 characters</span>
            <button onClick={() => { setText(""); setOutput(""); setError(""); }} className="rounded-full border border-white/15 px-4 py-2 text-sm">Clear</button>
          </div>
        </div>
        <div className="ds-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">AI summary</h2>
            <label className="text-sm text-muted">
              Length
              <select value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="ml-2 rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-foreground">
                <option value={2}>Short</option>
                <option value={3}>Balanced</option>
                <option value={5}>Detailed</option>
                <option value={8}>Extended</option>
              </select>
            </label>
          </div>
          <div aria-live="polite" className="mt-4 min-h-64 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7">
            {busy ? "Reading and summarizing your text with Gemini…" : output || "Your AI summary will appear here after you paste text and generate it."}
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={!text.trim() || busy} onClick={() => void summarize()} className="search-button rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50">
              {busy ? "Summarizing…" : "Generate AI summary"}
            </button>
            <button disabled={!output} onClick={() => void copySummary()} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold disabled:opacity-50">
              {copied ? "Copied!" : "Copy summary"}
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">Uses the configured Gemini model to understand context and key points. Review the summary for accuracy. Do not submit confidential information to the free-tier provider.</p>
        </div>
      </div>
    </section>
  );
}
