# Phase 7 — Admin Studio

## Included
- Responsive admin dashboard at `/admin` with Overview, Categories & tags, SEO controls, Design studio, Site settings and Social links.
- Category editor supports add/edit/delete, slugs, descriptions, tags, visibility preferences, per-category meta titles and meta descriptions.
- SEO defaults include a search-result preview and character counts.
- Design controls allow primary/accent/background color and font selection with a live admin preview.
- Site toggles for maintenance mode, roadmap visibility, analytics and ads; these are configuration preferences only and do not activate services.
- JSON export, local reset, localStorage persistence, responsive layout and no added dependencies.

## Important production boundary
This phase is a browser-local Admin Studio prototype. Data is stored only in the current browser via localStorage. It does **not** authenticate users, protect the route, publish settings to the public website, write to a shared database, or enforce maintenance/analytics/ads toggles. Do not deploy it as a production admin panel or store secrets in it.

## Phase 8 required for a real production admin
1. Choose and configure a persistent database and migrations.
2. Implement server-side authentication, secure sessions/cookies, role-based authorization, rate limits and CSRF protection as appropriate.
3. Store categories, tags, tool listings, metadata, site settings and theme tokens in the database.
4. Add validated server-side CRUD endpoints/actions and audit logging.
5. Wire published settings into public homepage/category metadata/theme and sitemap generation.
6. Add backup/export/restore with validation, safe image/media management and tests.
7. Verify CI, run local smoke tests and review security before any production deployment.

No database provider or credentials were available in this phase, so the persistent backend is intentionally not faked.
