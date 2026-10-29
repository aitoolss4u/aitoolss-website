# Phase 13 — Homepage, Gallery, and Popularity

## Homepage
- Hero headline: “Your Entire AI Universe.”
- The top header is removed from the homepage; the sticky category sidebar shares the top-level layout with the hero.
- Eight canonical tool categories come from the tool catalog, with visibility/order taken from Supabase when configured.
- Search and category filters continue to operate on the 60-tool catalog.
- Featured cards and category cards use purpose-designed CSS artwork, not fabricated third-party product screenshots.
- “AI Creations Gallery” is empty until an administrator publishes real media.
- The top-eight shortcut section uses tool-selection clicks in the previous 30 days. It stores only the selected tool slug and timestamp, not search text or visitor identity. Ties are sorted by slug. If the analytics API/database is unavailable or no events exist, the page uses catalog order and labels that fallback honestly.
- The dark footer includes six category actions, five supporting-page links, and the four social platforms. A social icon is clickable only after a non-root HTTPS profile URL is configured in Admin Studio.

## Supabase setup
Apply supabase/migrations/202610290001_phase13_gallery_popularity.sql in the Supabase SQL Editor after the existing Phase 8 migration. The migration creates:
- gallery_items with RLS for public published reads and admin-only mutations.
- site_settings.gallery_layout with defaults of 4 columns and 4 rows.
- site_settings.public_social, a public-read allowlisted social setting.
- tool_selection_events and get_popular_tool_slugs() for 30-day aggregation.

The public homepage falls back to the catalog and an empty gallery if Supabase is not configured. Admin gallery management requires valid Supabase configuration and an authenticated user with trusted app_metadata.role = admin.

## Admin gallery management
Open /admin/gallery while signed in as an administrator. Admins can add a media entry by supplying an HTTPS image/video URL, optional poster/thumbnail URL, title, description and creator; edit fields; publish/unpublish; reorder by sort order; delete with confirmation; and persist columns (4/5/6) and rows (3/4/5/6). The public API limits published items to columns × rows, and the grid adapts at smaller widths.

Direct binary file upload is not implemented because no storage bucket/upload infrastructure was present in the inspected project. This interface deliberately does not claim to upload files.

## APIs
- GET /api/categories: visible canonical categories, with catalog fallback.
- GET /api/gallery: published media and saved grid settings.
- GET /api/popular-tools: top tool slugs over the previous 30 days.
- POST /api/popular-tools: records a selected, known tool slug only.
- GET /api/social-links: returns configured HTTPS profile URLs, omitting generic social homepages.

## Validation
The repository CI runs tool catalog verification, ESLint, TypeScript, production build, and Playwright smoke tests. Supabase-backed admin CRUD and persistent setting updates still require testing against the owner's configured Supabase project.