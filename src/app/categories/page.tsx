import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import { categories, tools } from "@/lib/tools";

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

export default function CategoriesPage() {
  return (
    <PublicSiteChrome>
      <main className="info-page">
        <section className="info-article">
          <p className="section-kicker">EXPLORE BY CATEGORY</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Find your area of focus.</h1>
          <p className="section-description mt-4 max-w-2xl text-base leading-7">
            Choose one of AIToolss’ eight categories to open matching tools in the homepage search. This page is a quick route into the catalogue, not a full directory listing.
          </p>
          <div className="resource-category-grid mt-8">
            {categories.map((category, index) => (
              <Link key={category} href={`/?category=${encodeURIComponent(category)}#search`} className="resource-category-card">
                <span className="resource-category-mark" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="resource-category-card-copy">
                  <strong>{category}</strong>
                  <span>{categoryCopy[category] ?? "Explore useful tools for this category."}</span>
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
