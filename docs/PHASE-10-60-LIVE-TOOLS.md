# Phase 10 — 60 browser tools

## Scope
- Adds a shared directory catalog of 60 tool pages across Writing, Images, Productivity, Coding, Marketing, Education, Business and Career.
- Gives each catalog entry a real route and a browser-side interaction; JSON formatting, conversions, word counts, simple text organization, checklists, generators, URL/UTM utilities and image processing work without paid API keys.
- The catalog is explicit that outputs are rule-based/browser utilities, not hosted generative AI. No third-party AI API is called and input is not intentionally uploaded.
- The homepage reads the same catalog so counts, categories, search and links stay consistent.
- Existing Word Counter, Text Summarizer and Image Compressor routes remain in place; new dynamic route serves the other catalog slugs.

## Limits and verification
- “Live” here means implemented in the code branch, not deployed publicly.
- Generators and writing helpers use local templates/heuristics; they are not equivalent to an LLM-powered AI service.
- Image compression uses the browser canvas and JPEG output; transparent images may lose transparency.
- Before merge: run lint, typecheck, production build; manually exercise JSON invalid input, color conversions, date parsing, image compression and each category route.
- No main-branch merge, deployment, domain purchase or paid service is included.
