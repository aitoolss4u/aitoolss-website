import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const catalog = await readFile(new URL("../src/lib/tools.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/tools/[slug]/tool-page-client.tsx", import.meta.url), "utf8");
const aiRoute = await readFile(new URL("../src/app/api/tools/ai-chat/route.ts", import.meta.url), "utf8");
const humanizerRoute = await readFile(new URL("../src/app/api/tools/humanizer/route.ts", import.meta.url), "utf8");
const detailSections = await readFile(new URL("../src/components/tool-detail-sections.tsx", import.meta.url), "utf8");
const seoContent = await readFile(new URL("../src/lib/tool-seo.ts", import.meta.url), "utf8");
const seoDataSource = await readFile(new URL("../src/lib/tool-seo-data.ts", import.meta.url), "utf8");
const seoDataMarker = seoDataSource.indexOf("=");
assert.ok(seoDataMarker > 0, "persisted SEO data export must be present");
const seoRecords = JSON.parse(seoDataSource.slice(seoDataMarker + 1).trim().replace(/;\s*$/, ""));
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
assert.ok(route.includes('const usesAI = slug === "ai-chatbot";'), "AI chatbot must use the server-backed AI route");
assert.ok(route.includes('fetch("/api/tools/ai-chat"'), "AI chatbot must call its server endpoint");
assert.ok(!route.includes("Local template response (no trained AI model is connected)"), "AI chatbot must not return a template in place of a model response");
assert.ok(aiRoute.includes("AI_GATEWAY_API_KEY") && aiRoute.includes("AI_MODEL"), "AI endpoint must require explicit server-side Gateway configuration");
assert.ok(aiRoute.includes("https://ai-gateway.vercel.sh/v1/chat/completions"), "AI endpoint must call the configured AI Gateway");
assert.ok(aiRoute.includes("GEMINI_API_KEY") && aiRoute.includes("gemini-3.7-flash"), "AI chat must support direct Gemini Free Tier configuration");
assert.ok(route.includes('fetch("/api/tools/humanizer"'), "AI Humanizer must call its real server endpoint");
assert.ok(humanizerRoute.includes("AI_GATEWAY_API_KEY"), "AI Humanizer must support an approved server-side AI Gateway key");
assert.ok(humanizerRoute.includes("GEMINI_API_KEY") && humanizerRoute.includes("gemini-3.7-flash"), "AI Humanizer must support direct Gemini Free Tier configuration");
assert.ok(humanizerRoute.includes("generativelanguage.googleapis.com"), "AI Humanizer must call the Gemini API directly when configured");
assert.ok(humanizerRoute.includes("AI_HUMANIZER_PRO_MODEL") && humanizerRoute.includes("AI_HUMANIZER_ULTRA_MODEL"), "Humanizer model tiers must be explicitly configured");
assert.ok(humanizerRoute.includes("MAX_TEXT_LENGTH = 12_000"), "AI Humanizer must enforce a bounded input size");
assert.ok(humanizerRoute.includes("Preserve the author's meaning"), "AI Humanizer must preserve supplied meaning and facts");
assert.ok(humanizerRoute.includes("not an AI-detection evasion task"), "AI Humanizer must not claim detector evasion");
assert.ok(route.includes('className="humanizer-comparison"'), "AI Humanizer must compare original and rewritten text");
assert.ok(route.includes("Rewrite strength"), "AI Humanizer must expose rewrite-strength control");
const galleryPage = await readFile(new URL("../src/app/admin/gallery/page.tsx", import.meta.url), "utf8");
const backupPage = await readFile(new URL("../src/app/admin/backups/page.tsx", import.meta.url), "utf8");
const adminTheme = await readFile(new URL("../src/app/admin/admin-theme.css", import.meta.url), "utf8");
const r2Library = await readFile(new URL("../src/lib/r2.ts", import.meta.url), "utf8");
const r2Migration = await readFile(new URL("../supabase/migrations/202610310003_r2_media_and_drive_backups.sql", import.meta.url), "utf8");
assert.ok(galleryPage.includes('className="admin-gallery-form"') && galleryPage.includes('gridTemplateColumns:"repeat(2,minmax(0,1fr))"'), "Gallery upload form must use a stable two-column layout");
assert.ok(adminTheme.includes(".admin-gallery-form > .admin-r2-uploader") && adminTheme.includes("grid-column: 1 / -1"), "R2 uploader must occupy its own full-width grid row");
assert.ok(backupPage.includes("updateGalleryBackup") && backupPage.includes("Google Drive sharing URL"), "Drive backups must have a dedicated backup management page");
assert.ok(r2Library.includes("getR2ConfigurationStatus"), "Admin pages must show which R2 configuration variables are missing");
assert.ok(r2Migration.includes("add column if not exists r2_object_key") && r2Migration.includes("add column if not exists backup_google_drive_url"), "R2 metadata migration must add object and Drive backup fields");
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
