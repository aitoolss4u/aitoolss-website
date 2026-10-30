"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";
import { categories } from "@/lib/tools";

const categoryCopy: Record<string, string> = {
  Writing: "Summaries, rewrites, clearer messages and useful text helpers.",
  Images: "Browser-based image checks, compression and color utilities.",
  Productivity: "Plan focused work, structure ideas and simplify everyday tasks.",
  Coding: "Format data, convert values and work with developer-friendly utilities.",
  Marketing: "Draft captions, video outlines and practical marketing copy.",
  Education: "Organize study material and build practice resources.",
  Business: "Structure decisions, plan meetings and calculate useful business figures.",
  Career: "Prepare resumes, cover letters and interview practice.",
};

type CategoryItem = { name: string; description: string; image_url: string | null };

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>(categories.map((name) => ({ name, description: "", image_url: null })));
  useEffect(() => {
    let active = true;
    fetch("/api/categories")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !Array.isArray(data?.items)) return;
        const next = data.items.filter((item: unknown): item is CategoryItem => {
          if (!item || typeof item !== "object") return false;
          const candidate = item as CategoryItem;
          return typeof candidate.name === "string" && categories.includes(candidate.name);
        });
        if (next.length) setItems(next);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  return (
    <PublicSiteChrome>
      <main className="info-page">
        <section className="info-article">
          <p className="section-kicker">EXPLORE BY CATEGORY</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Find your area of focus.</h1>
          <p className="section-description mt-4 max-w-2xl text-base leading-7">
            Choose from eight categories configured in the AIToolss catalogue. Each card opens the matching homepage search filter.
          </p>
          <div className="resource-category-grid mt-8">
            {items.slice(0, 8).map((item, index) => (
              <Link key={item.name} href={`/?category=${encodeURIComponent(item.name)}#search`} className="resource-category-card">
                {item.image_url ? <img src={item.image_url} alt="" className="resource-category-image" /> : <span className="resource-category-mark" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
                <span className="resource-category-card-copy">
                  <strong>{item.name}</strong>
                  <span>{item.description || categoryCopy[item.name] || "Explore useful tools for this category."}</span>
                  <small>Explore category <span aria-hidden="true">↗</span></small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PublicSiteChrome>
  );
}
