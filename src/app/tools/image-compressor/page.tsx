"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CompressedImage = { url: string; size: number; width: number; height: number; name: string };

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState("image/webp");
  const [result, setResult] = useState<CompressedImage | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result?.url]);

  const formatBytes = (bytes: number) => bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + " KB" : (bytes / (1024 * 1024)).toFixed(2) + " MB";

  async function compress() {
    if (!file) return;
    setError(""); setResult(null); setBusy(true);
    let sourceUrl = "";
    try {
      sourceUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = sourceUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not read this image. Try a JPEG, PNG, or WebP file."));
      });
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser does not support image processing.");
      context.drawImage(image, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Compression failed. Please try another format.")), format, quality);
      });
      const extension = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
      setResult({ url: URL.createObjectURL(blob), size: blob.size, width: canvas.width, height: canvas.height, name: file.name.replace(/\.[^.]+$/u, "") + "-compressed." + extension });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Something went wrong. Please try another image.");
    } finally {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      setBusy(false);
    }
  }

  return <main className="site-shell min-h-screen px-5 pb-16">
    <header className="mx-auto flex max-w-6xl items-center justify-between py-6"><Link href="/" className="text-xl font-extrabold">AIToolss<span className="brand-dot">.</span></Link><Link href="/#tools" className="nav-link text-sm">← All tools</Link></header>
    <section className="mx-auto max-w-4xl pt-10"><p className="section-kicker">FREE IMAGE UTILITY</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">Image Compressor<span className="heading-period">.</span></h1><p className="section-description mt-4 max-w-2xl leading-7">Reduce image file size right in your browser. Choose a format and quality, then download the result. Your image stays on your device.</p>
      <div className="ds-panel mt-8 p-5 sm:p-7"><label htmlFor="image-file" className="block text-sm font-bold">Choose an image</label><input id="image-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setResult(null); setError(""); }} className="mt-3 block w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:font-bold file:text-white"/>{file && <p className="mt-3 text-sm text-muted">Selected: {file.name} · {formatBytes(file.size)}</p>}
        <div className="mt-6 grid gap-5 sm:grid-cols-2"><div><label htmlFor="quality" className="flex justify-between text-sm font-semibold"><span>Quality</span><span>{Math.round(quality * 100)}%</span></label><input id="quality" type="range" min="0.2" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-3 w-full accent-violet-400"/><p className="mt-1 text-xs text-muted">Lower quality often creates smaller files.</p></div><div><label htmlFor="format" className="block text-sm font-semibold">Output format</label><select id="format" value={format} onChange={(event) => setFormat(event.target.value)} className="mt-3 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-3 text-sm"><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG (quality control not supported)</option></select></div></div>
        <button onClick={() => void compress()} disabled={!file || busy} className="search-button mt-6 rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-50">{busy ? "Compressing…" : "Compress image ↗"}</button>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
      </div>
      {result && file && <div className="ds-panel mt-5 p-5"><h2 className="text-lg font-bold">Your compressed image</h2><div className="mt-4 grid gap-5 sm:grid-cols-2"><div className="rounded-xl bg-black/20 p-3"><img src={result.url} alt="Compressed image preview" className="max-h-80 w-full object-contain"/></div><div className="flex flex-col items-start justify-center gap-3"><p className="text-sm text-muted">Original: <strong className="text-foreground">{formatBytes(file.size)}</strong></p><p className="text-sm text-muted">Compressed: <strong className="text-foreground">{formatBytes(result.size)}</strong></p><p className="text-sm text-muted">Dimensions: <strong className="text-foreground">{result.width} × {result.height}</strong></p>{result.size < file.size ? <p className="text-sm text-emerald-300">Reduced by {Math.round((1 - result.size / file.size) * 100)}%</p> : <p className="text-sm text-amber-300">This output is not smaller. Try a different format or quality.</p>}<a href={result.url} download={result.name} className="search-button rounded-xl px-5 py-3 text-sm font-bold">Download image ↓</a></div></div></div>}
    </section>
  </main>;
}
