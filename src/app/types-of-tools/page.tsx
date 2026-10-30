import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";
import { tools } from "@/lib/tools";

export const metadata = {
  title: "Types of Tools",
  description: "A curated guide to the kinds of practical tools available on AIToolss.",
};

const typeGroups = [
  { title: "Writing & text", description: "Make information clearer, shorter and easier to use.", slugs: ["text-summarizer", "word-counter"] },
  { title: "Ideas & prompts", description: "Turn a topic or rough thought into a useful starting point.", slugs: ["prompt-generator", "headline-generator"] },
  { title: "Checklists & planning", description: "Organize work into steps, prompts and repeatable plans.", slugs: ["grammar-checklist", "daily-planner"] },
  { title: "Calculators", description: "Calculate common values without opening a separate tool.", slugs: ["aspect-ratio-calculator", "invoice-tax-calculator"] },
  { title: "Formatters & converters", description: "Clean up structured text and convert common data formats.", slugs: ["markdown-formatter", "json-formatter"] },
  { title: "Image utilities", description: "Inspect image dimensions and reduce file size in your browser.", slugs: ["image-compressor", "image-dimension-checker"] },
] as const;

export default function TypesOfToolsPage() {
  return (
    <PublicSiteChrome>
      <main className="info-page">
        <section className="info-article">
          <p className="section-kicker">A CURATED GUIDE</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Types of tools.</h1>
          <p className="section-description mt-4 max-w-2xl text-base leading-7">
            Start with the kind of task you want to complete. These groups are a short guide with a few real examples from the current catalogue—not an exhaustive list of every tool.
          </p>
          <div className="resource-type-grid mt-8">
            {typeGroups.map((group, index) => (
              <section key={group.title} className="resource-type-card">
                <span className="resource-category-mark" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
                <nav aria-label={`${group.title} examples`} className="resource-example-links">
                  {group.slugs.map((slug) => {
                    const tool = tools.find((item) => item.slug === slug);
                    return tool ? <Link key={tool.slug} href={`/tools/${tool.slug}`}>{tool.name} <span aria-hidden="true">↗</span></Link> : null;
                  })}
                </nav>
              </section>
            ))}
          </div>
        </section>
      </main>
    </PublicSiteChrome>
  );
}
