# AI tool execution and provider setup

AITOOLSS uses real server-side Gemini responses for the AI Chatbot, AI Humanizer, Text Summarizer, Prompt Generator, translation, and the other configured writing/productivity generators. These routes do not substitute canned answers when the provider is missing or fails.

## Required free-tier configuration

Add `GEMINI_API_KEY` as an encrypted/server-only Vercel environment variable for Preview and Production. Create the key in Google AI Studio:

- https://aistudio.google.com/apikey

Never add the key to a `NEXT_PUBLIC_*` variable, commit it, print it in logs, or send it to the browser.

Optional model variables:

- `GEMINI_MODEL`: shared fallback model; recommended `gemini-3.1-flash-lite`.
- `GEMINI_CHAT_MODEL`: chatbot model; defaults to `GEMINI_MODEL`, then `gemini-3.1-flash-lite`.
- `GEMINI_TOOLS_MODEL`: writing/productivity generator model; defaults to `GEMINI_MODEL`, then `gemini-3.1-flash-lite`.
- `GEMINI_HUMANIZER_LITE_MODEL`: Humanizer Lite; defaults to `GEMINI_MODEL`, then `gemini-3.1-flash-lite`.
- `GEMINI_HUMANIZER_PRO_MODEL` and `GEMINI_HUMANIZER_ULTRA_MODEL`: optional explicit model identifiers. These tiers remain unavailable until configured.

No AI Gateway credential is required for the direct Gemini path. A Gateway key is only used when the owner explicitly adds one. The app does not enable billing, create provider accounts, or enable paid top-ups.

## Runtime routes

- `/api/tools/ai-chat`: AI Chatbot. Keeps recent conversation context, validates message size, applies a per-runtime IP rate limit and uses a bounded provider timeout.
- `/api/tools/ai-generate`: task-specific prompts for Prompt Generator, Text Summarizer, translator, headline/blog/essay tools, code explanation, emails, captions, flashcards, quizzes, business names, planners, meeting tools, product descriptions, and other configured generators.
- `/api/tools/humanizer`: editorial rewriting with Lite/Pro/Ultra model selection and style/reading-level/strength controls.
- `/api/tools/plagiarism`: local phrase-overlap comparison against only the sources supplied by the user; it does not search the public web or academic databases.

AI endpoints reject invalid or oversized inputs, return explicit provider/quota errors and never return a local template when model generation fails. Per-runtime rate limits are a basic barrier, not a distributed abuse-prevention system. Add a shared rate-limit provider only after the owner approves its cost.

## Privacy and accuracy

Text submitted to Gemini is sent to Google's API. Google may use free-tier content to improve its products under its free-tier terms. Do not submit confidential, personal, client, legal, medical or otherwise sensitive information through a free-tier key. Review generated facts, citations, translations and calculations before use. The Humanizer improves readability; it does not guarantee or promise evasion of AI detectors.

## Background Remover

The Background Remover uses `@bg0/browser`, a browser-local BiRefNet segmentation implementation. It prefers WebGPU and can fall back to WebAssembly. The first run downloads the model and later runs can use the browser cache. The selected image is processed on-device and is not uploaded to AITOOLSS servers.

The browser package is Apache-2.0. The pinned BiRefNet model exports are MIT-licensed according to BG0's third-party notices. Model assets are downloaded by the browser at runtime; an internet connection is required on the first run. A device/browser may be too constrained for high-resolution inference, in which case the tool must show a clear error rather than a fake cutout.

## Tools that intentionally are not AI classifiers

- AI Image Detector / AI Video Detector currently inspect file metadata, pixels or sampled frames locally. They do not run a validated AI-authenticity classifier and must not present a probability or definitive authenticity verdict.
- Plagiarism Checker compares five-word phrases only with text pasted by the user. It does not crawl the web or access academic databases.
- Dictionary uses the public dictionaryapi.dev endpoint; uptime and rate limits are controlled by that service.

## Deterministic browser tools

Calculators, word counts, formatters, URL/Base64/HTML encoders, JSON/CSV conversion, timestamp conversion, image dimensions and password generation should stay deterministic and local. They must validate inputs and return reproducible outputs rather than call an LLM for exact calculations.

## Supabase catalogue

The public tool catalogue route reads `public.tools`. If production logs report that this table is missing, apply the ordered SQL migrations in `supabase/migrations` to the connected Supabase project. Applying repository migrations to Supabase is a separate database action; a GitHub push alone does not execute SQL against the database.
