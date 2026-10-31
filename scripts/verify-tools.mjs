import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const catalog = await readFile(new URL("../src/lib/tools.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/tools/[slug]/tool-page-client.tsx", import.meta.url), "utf8");
const detailSections = await readFile(new URL("../src/components/tool-detail-sections.tsx", import.meta.url), "utf8");
const seoContent = await readFile(new URL("../src/lib/tool-seo.ts", import.meta.url), "utf8");
const seoDataSource = await readFile(new URL("../src/lib/tool-seo-data.ts", import.meta.url), "utf8");
const seoDataMarker = seoDataSource.indexOf("=");
assert.ok(seoDataMarker > 0, "persisted SEO data export must be present");
const seoRecords = JSON.parse(seoDataSource.slice(seoDataMarker + 1).trim().replace(/;\\s*$/, ""));
const entries = [...catalog.matchAll(/^\["([^"]+)","([^"]+)","([^"]+)"/gm)].map((match) => ({
  name: match[1],
  slug: match[2],
  category: match[3],
}));

assert.equal(entries.length, 74, "catalog must contain exactly 74 tools");
assert.equal(new Set(entries.map((entry) => entry.slug)).size, 74, "tool slugs must be unique");
assert.equal(new Set(entries.map((entry) => entry.name)).size, 74, "tool names must be unique");
assert.ok(entries.every((entry) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)), "all slugs must be URL-safe");
assert.deepEqual(
  [...new Set(entries.map((entry) => entry.category))].sort(),
  ["Business", "Career", "Coding", "Education", "Images", "Marketing", "Productivity", "Writing"].sort(),
  "catalog must include all eight expected categories",
);

const cases = [...route.matchAll(/case\s+"([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(cases).size, cases.length, "tool runner must not contain duplicate switch cases");
for (const slug of ["word-counter", "text-summarizer", "pomodoro-timer", "ai-image-detector", "ai-video-detector", "grammar-checker", "plagiarism-checker", "ai-humanizer", "paraphrasing-tool", "summarizer", "translator", "background-remover", "ai-chatbot", "dictionary", "ai-email-helper", "citation-generator", "image-compressor", "image-dimension-checker", "color-palette-builder", "decision-matrix", "json-formatter", "random-password-generator"]) {
  assert.ok(entries.some((entry) => entry.slug === slug), `expected tool missing from catalog: ${slug}`);
  assert.ok(route.includes(`"${slug}"`), `expected representative tool handler missing: ${slug}`);
}

assert.ok(detailSections.includes('data-section="related-tools"'), "shared tool layout must place Related Tools in its section");
assert.ok(detailSections.includes('data-section="seo-content"'), "shared tool layout must render visible SEO content after Related Tools");
assert.ok(detailSections.includes('data-faq-item="true"'), "shared tool layout must render interactive FAQs");
assert.ok(seoContent.includes("howToUse") && seoContent.includes("faqs"), "tool-specific SEO copy must include usage steps and FAQs");
assert.equal(Object.keys(seoRecords).length, entries.length, "every published tool must have a persisted SEO record");
for (const entry of entries) {
  const seo = seoRecords[entry.slug];
  assert.ok(seo, `persisted SEO content missing for ${entry.slug}`);
  assert.ok(seo.introduction && seo.whatIs, `SEO introduction or explanation missing for ${entry.slug}`);
  assert.ok(Array.isArray(seo.howToUse) && seo.howToUse.length >= 3, `tool-specific how-to steps missing for ${entry.slug}`);
  assert.equal(seo.faqs.length, 6, `expected exactly six FAQs for ${entry.slug}`);
  assert.equal(new Set(seo.faqs.map((faq) => faq.question)).size, 6, `FAQ questions must be unique for ${entry.slug}`);
  assert.ok(seo.metaTitle && seo.metaDescription && seo.ogTitle && seo.ogDescription, `SEO head metadata missing for ${entry.slug}`);
}

for (const slug of ["word-counter", "text-summarizer", "image-compressor"]) {
  const page = await readFile(new URL(`../src/app/tools/${slug}/page.tsx`, import.meta.url), "utf8");
  assert.ok(page.includes("ToolDetailSections"), `${slug} must use the shared detail layout`);
}

console.log(`Tool verification passed: ${entries.length} unique tools across 8 categories; no duplicate handlers.`);
