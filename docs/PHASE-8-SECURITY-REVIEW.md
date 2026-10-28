# Phase 8 security review checklist

- [ ] Confirm `.env.local` is ignored by Git and is never committed.
- [ ] Confirm no service-role/secret key appears in source, CI variables, screenshots or logs.
- [ ] Apply migration to a disposable Supabase project first.
- [ ] Anonymous requests cannot read `site_settings` or `admin_audit_log`.
- [ ] Anonymous requests can read only visible categories.
- [ ] Authenticated non-admin cannot write categories/settings or read audit log.
- [ ] Authenticated admin can sign in and access `/admin`.
- [ ] Non-admin sign-in is immediately signed out and denied.
- [ ] Sign-out clears session and redirects to `/admin/login`.
- [ ] Test malformed inputs, duplicate slugs, oversized metadata and invalid tags once CRUD is wired.
- [ ] Verify recovery/reset flow and auth rate limiting before production.
- [ ] Verify public pages still render without Supabase environment variables.
