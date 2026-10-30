"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";
import { categories } from "@/lib/tools";

export const metadata = {
  title: "AI Tool Categories",
  description: "Explore AIToolss by its eight curated tool categories.",
};

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
  useEffect(() => { fetch("/api/categories").then((response) => response.ok ? response.json() : null).then((data) => { if (Array.isArray(data?.items)) setItems(data.items.filter((item: unknown): item is CategoryItem => Boolean(item && typeof item === "object" && typeof (item as CategoryItem).name === "string" && categories.includes((item as CategoryItem).name))); }).catch(() => undefined); }, []);
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
