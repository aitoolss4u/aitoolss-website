# Phase 13 UI Critical Fixes

## Root causes found

- The previous search effect rotated a complete conic gradient and used a blurred pseudo-element behind the wrapper's isolated stacking context. This did not create a distinctly moving highlight arc around the entire rounded perimeter.
- The tool detail route hard-coded `bg-[#080b14]` and `text-slate-100`, so each tool opened on a dark page regardless of the light homepage theme.
- The homepage owned its sidebar and footer markup locally; tool routes had no shared layout, and public information pages did not reuse the footer/sidebar.
- The category shortcut grid depended on Tailwind's `xl` breakpoint for eight columns, which kept the row broken into multiple columns on some desktop widths.
- Directory and popular-tool cards had a small nested link as the only destination target; the larger card surface did not navigate.

## Changes

- Added reusable `PublicSidebar`, `PublicFooter`, and `PublicSiteChrome` components.
- Added a shared App Router layout under `src/app/tools/layout.tsx`; tool detail routes now use the common sidebar and footer.
- Applied the shared public chrome to About, Contact, Disclaimer, Privacy, and Terms pages. Admin and admin sign-in layouts remain separate.
- Replaced hard-coded dark tool-page colors with shared light components and design tokens.
- Reworked the search border to use a registered angle property and a moving violet/blue/cyan highlight segment with a pointer-transparent glow; reduced-motion mode uses a static gradient.
- Made eight canonical catalog categories the fallback when the database returns a partial category list; removed the redundant suggestion row so shortcuts sit immediately below search.
- Made popular-tool, directory-tool, and image gallery cards full-surface links. Featured and category cards retain their existing full-card targets; video playback controls remain usable and have a clear open-video action.
- Added E2E checks for the shared sidebar and the changing animation angle.

## Validation

CI is configured to run the tool catalog check, ESLint, TypeScript, production build, and Playwright browser smoke tests for this branch. A Supabase-backed runtime still requires the project's own Supabase configuration. Do not treat an unexecuted local browser session as verified.
