# Phase 5 — Pre-deployment checklist

This phase prepares AIToolss for review before any production deployment. It does not deploy the site or change the `main` branch.

## Implemented in this phase

- [x] Disable the `X-Powered-By` response header.
- [x] Add baseline security response headers in `next.config.ts`.
- [x] Add a branded App Router `not-found.tsx` page.
- [x] Keep this work isolated on `phase-5-predeployment-hardening` until reviewed.

## Required verification before merging

- [ ] GitHub Actions passes for lint, TypeScript type-check, and production build.
- [ ] Inspect response headers in a deployed preview or local HTTP response.
- [ ] Test homepage search, category filters, and empty-state reset.
- [ ] Test Word Counter with empty text, whitespace, punctuation, and Unicode text.
- [ ] Test Text Summarizer with short and long text, sentence-count changes, and copy action.
- [ ] Test Image Compressor with supported formats, unsupported files, quality changes, and download.
- [ ] Verify unknown URLs show the branded 404 page.
- [ ] Check keyboard navigation, visible focus, reduced-motion behavior, and mobile layouts.
- [ ] Review privacy and terms pages against the actual hosting, analytics, cookies, and business practices.
- [ ] Confirm canonical site URL before enabling production indexing and sitemap submission.

## Security notes

The current response headers are a baseline, not a complete security audit. A Content Security Policy is intentionally not added here because it must be designed and tested against the final hosting setup and any scripts the site actually uses. Do not add third-party scripts, analytics, or advertising without reviewing their privacy and security implications.

## Release boundaries

- Do not merge this phase into `main` without explicit approval.
- Do not deploy production from this branch.
- Do not buy a domain yet; first verify the application and choose the final hosting setup.
- Advertising placements should remain disabled until the site, privacy disclosures, and ad-provider requirements are reviewed.
- The current directory contains three usable browser-based tools; planned directory entries are not fully implemented tools.
