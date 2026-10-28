# Phase 9 — Supabase-backed Admin Studio

## Included in this phase
- Admin Studio loads categories and global settings from Supabase after the authenticated server-side role check.
- Save writes category metadata, tags, visibility, ordering, and the allowlisted global settings object.
- Server actions validate category names, slug format/uniqueness, field lengths, category count and payload size.
- Admin save events write a minimal audit record (actor, action, category count and settings keys; no passwords or secrets).
- Failed database writes show an actionable status message; the UI does not report success unless the save action returns success.
- Starter defaults can be restored, and JSON configuration export remains available.

## Required setup
Complete the project setup in [Phase 8 Supabase setup](./PHASE-8-SUPABASE-SETUP.md) first. Apply the Phase 8 SQL migration and set the administrator's trusted `app_metadata.role = admin` claim. Configure `.env.local` from `.env.example`.

## Scope boundary
This phase makes the **admin configuration persist in Supabase**. It does not yet dynamically render public category pages, apply saved metadata to Next.js page metadata, apply site-wide colors/fonts, or activate maintenance mode, analytics or ads. Those switches remain stored preferences until each corresponding public-site integration is implemented and reviewed. Do not interpret stored configuration as a deployed/live change.

## Review and verification
- Review the branch and pull request before merging.
- CI runs lint, TypeScript checks and a production build. The CI build has no project credentials and cannot test against a real Supabase project.
- Before launch, manually test sign-in, non-admin denial, create/edit/delete categories, duplicate slugs, empty category list, save/reload persistence, RLS policies, and audit log with a disposable Supabase project.
- No deployment or domain changes are included.
