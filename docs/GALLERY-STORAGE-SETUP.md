# Gallery storage setup

Gallery uploads use the existing Supabase project and a persistent public bucket named `aitoolss-gallery`. The server action verifies the signed-in user's `app_metadata.role=admin`, checks the MIME type and a 50 MB maximum, creates a random object name, uploads to Supabase Storage and stores only the public URL in `gallery_items`.

Before enabling uploads, apply this migration in the Supabase SQL Editor:

`supabase/migrations/202610300001_phase14_public_customization.sql`

It creates the public bucket, restricts insert/update/delete to authenticated admin users, and permits public reads only from that bucket. The website's existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` settings are used; no service-role key is exposed to the browser.

Supported formats: JPEG, PNG, WebP, GIF, MP4 and WebM. Maximum file size: 50 MB. The admin editor supports both direct uploads and public HTTPS URLs. Files stored in the bucket are removed when a gallery entry is deleted if the URL points to that bucket.

If the migration has not been applied, uploads will fail with an error rather than showing a false success.
