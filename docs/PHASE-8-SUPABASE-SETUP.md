# Phase 8 — Supabase admin foundation

This phase adds the first server-authenticated admin entry point and a database schema. It is deliberately not deployed, and the existing Admin Studio editor is not yet wired to persist changes to Supabase. Do not treat this as launch-ready until Phase 9 connects every control and public pages to validated server-side data.

## Included

- Email/password sign-in through Supabase Auth; no public registration form.
- Admin authorization requires the trusted `app_metadata.role = "admin"` claim. A user who can sign in but lacks this claim is signed out.
- Server-side auth guard on `/admin`; login page at `/admin-login`.
- Supabase SSR cookie handling and a Next.js request proxy for refreshing sessions.
- SQL migration for categories, site settings and an admin audit log, with row-level security (RLS).
- Starter category seed data; no credentials, keys or real users are committed.

## 1. Create a Supabase project

Create a project in your Supabase dashboard and choose the Free plan if it meets your needs. Free-tier quotas and availability can change; review the current plan limits in Supabase before relying on it.

In Project Settings → API (or Connect), copy the project URL and the publishable key / anon key. Add them to a local `.env.local` file based on `.env.example`. These two `NEXT_PUBLIC_` values are designed to be public; RLS is what protects database rows. Never put a service-role/secret key in any `NEXT_PUBLIC_` variable, Git commit, screenshot, issue or chat.

## 2. Apply the schema

Open Supabase SQL Editor, paste and run `supabase/migrations/202610280001_phase8_admin_foundation.sql`. The migration enables RLS and adds policies; inspect the SQL before running it in a real project.

## 3. Create the first administrator

In Supabase Dashboard → Authentication → Users, create an account for the intended administrator with email/password and confirm the account as appropriate for your settings. Then open that user's record and set the trusted **app metadata** JSON to:

```json
{ "role": "admin" }
```

Use app metadata, not user-editable user metadata. Do not enable public sign-ups just to create an administrator. If the dashboard does not expose editing app metadata, use a trusted server-side admin workflow or Supabase's supported admin API from a private environment; never place a service-role key in client code.

## 4. Run locally

Install dependencies, copy the environment template to `.env.local`, fill in the project URL and publishable/anon key, then run the app. For Windows PowerShell environments with npm script policy issues, use `npm.cmd install`, `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd run build`.

Without environment variables, the login screen will explain that setup is incomplete. This repository's CI does not need production secrets because it runs static checks/build only.

## Security boundaries / next work

- No service-role key is used by the web app.
- Server-side checks use `auth.getUser()` plus the trusted app metadata role; RLS independently checks the JWT role.
- Database tables are not yet connected to the existing browser-local Admin Studio state. Phase 9 should replace localStorage persistence with server actions or route handlers that validate input, write audit records, and use the authenticated Supabase session.
- Public directory/category reads, live SEO metadata, design/theme publishing, social links, maintenance mode, and audit-log recording are not wired end-to-end yet.
- Before production: verify rate limits, email/password policy, account recovery, admin provisioning, migration rollback/backup, RLS behavior, and security tests.
- No deployment was performed and no domain purchase is needed for this phase.
