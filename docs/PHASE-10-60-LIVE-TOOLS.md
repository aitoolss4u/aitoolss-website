# AITOOLSS tool catalogue — implementation notes

## Catalogue

The shared catalogue contains 74 unique tool routes across Writing, Images, Productivity, Coding, Marketing, Education, Business and Career. Every catalogue slug must have an explicit implementation path: a deterministic local handler, a dedicated media/library workflow, or a real server-side AI endpoint.

## AI-backed workflows

- AI Chatbot: `/api/tools/ai-chat` with recent conversation context.
- AI Humanizer: `/api/tools/humanizer`.
- Contextual writing/productivity tools, including Prompt Generator, Text Summarizer, paraphrasing, grammar correction, translation, code explanation, email/caption/content drafting, study helpers and business planning: `/api/tools/ai-generate`.
- Gemini API keys remain server-side. Missing configuration, quota exhaustion and provider errors are surfaced; no template answer is substituted.

## Deterministic/local workflows

Word counting, calculators, JSON/CSV conversion, encoders/decoders, colour conversion, URL/UTM utilities, timestamp conversion, password generation, image compression and dimensions use deterministic local logic and input validation. They do not call an LLM for exact calculations.

## Media workflows and truth in labeling

- Background removal uses browser-local BiRefNet segmentation through `@bg0/browser`, with WebGPU/WASM support and transparent PNG output. First use downloads and caches the model; source images remain on-device.
- Image/video "AI detector" pages are currently local media inspectors only. They do not classify AI provenance or return an authenticity probability.
- Plagiarism Checker performs phrase overlap against sources pasted by the user only; it does not search the public internet or academic databases.
- Dictionary uses a third-party public dictionary endpoint; external uptime and rate limits apply.

## Verification

The tool verification script checks the 74-entry catalogue, AI route coverage, background-removal engine, shared page wiring, storage/admin prerequisites and SEO record completeness. Before merging, run catalogue verification, lint, TypeScript, production build and browser smoke tests. Exercise valid and invalid JSON, conversions, dates, file uploads, model loading and provider failures.

A code change is not considered production-ready until the Preview deployment and actual user-facing routes are tested. A successful build alone does not prove a third-party AI provider, model download or browser-specific media workflow works.
