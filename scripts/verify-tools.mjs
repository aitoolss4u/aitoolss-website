import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const catalog = await readFile(new URL("../src/lib/tools.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/tools/[slug]/page.tsx", import.meta.url), "utf8");
const entries = [...catalog.matchAll(/^\["([^"]+)","([^"]+)","([^"]+)"/gm)].map((match) => ({
  name: match[1],
  slug: match[2],
  category: match[3],
}));

assert.equal(entries.length, 60, "catalog must contain exactly 60 tools");
assert.equal(new Set(entries.map((entry) => entry.slug)).size, 60, "tool slugs must be unique");
assert.equal(new Set(entries.map((entry) => entry.name)).size, 60, "tool names must be unique");
assert.ok(entries.every((entry) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)), "all slugs must be URL-safe");
assert.deepEqual(
  [...new Set(entries.map((entry) => entry.category))].sort(),
  ["Business", "Career", "Coding", "Education", "Images", "Marketing", "Productivity", "Writing"].sort(),
  "catalog must include all eight expected categories",
);

const cases = [...route.matchAll(/case\s+"([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(cases).size, cases.length, "tool runner must not contain duplicate switch cases");
for (const slug of ["word-counter", "text-summarizer", "image-compressor", "image-dimension-checker", "color-palette-builder", "decision-matrix", "json-formatter", "random-password-generator"]) {
  assert.ok(entries.some((entry) => entry.slug === slug), `expected tool missing from catalog: ${slug}`);
  assert.ok(route.includes(`"${slug}"`), `expected representative tool handler missing: ${slug}`);
}

console.log(`Tool verification passed: ${entries.length} unique tools across 8 categories; no duplicate handlers.`);
