# Gallery storage and backup setup

## Architecture
Vercel hosts the Next.js app and authenticated admin APIs. Supabase stores category/gallery records and media metadata. Cloudflare R2 is the primary store for new files after the owner configures credentials, bucket and CDN. Public delivery uses `https://media.aitoolss.com/`. Google Drive links are backup references only.

## Database
Run `supabase/migrations/202610310003_r2_media_and_drive_backups.sql` in Supabase SQL Editor after Phase 14 and Phase 15. It adds storage and backup metadata without deleting existing media or legacy Supabase Storage objects.

## One-time Cloudflare setup
1. Create a Standard R2 bucket named `aitoolss-gallery`.
2. Create an R2 API token scoped to that bucket with Object Read & Write. Save the Access Key ID and Secret Access Key.
3. Connect the custom domain `media.aitoolss.com` to the bucket in R2 settings. Public-read only; do not enable public write or use `r2.dev` in production.
4. Use only the DNS target provided by R2 custom-domain flow. Do not alter apex/www Vercel records, MX or auth records.
5. Configure bucket CORS:
```json
[{"AllowedOrigins":["https://aitoolss.com","https://www.aitoolss.com"],"AllowedMethods":["PUT","GET","HEAD"],"AllowedHeaders":["Content-Type"],"ExposeHeaders":["ETag"],"MaxAgeSeconds":3600}]
```
6. Add to Vercel Production (Preview only if required) and redeploy:
```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=aitoolss-gallery
R2_S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://media.aitoolss.com
```
Never use NEXT_PUBLIC_ prefixes for R2 credentials. The S3 endpoint can be derived from R2_ACCOUNT_ID if R2_S3_ENDPOINT is blank.

## Uploads, optimization and video
Browser uploads use short-lived signed PUT URLs and server-side HEAD verification. Image originals, optimized WebP (max 1200px) and 400px WebP thumbnails have separate keys in gallery/images/original, optimized and thumbnails. GIFs remain original to preserve animation. Category originals and optimized WebP use categories/{category-id}/original and optimized. Videos upload as MP4/WebM originals under gallery/videos/original; a browser-decoded WebP poster is generated when possible under gallery/videos/posters. No serverless proxy is used for video bytes. This app does not transcode to H.264 or generate HLS/DASH; upload an already optimized MP4/WebM. Players should use native controls, playsInline and preload=none.

## Manual Google Drive backup
Upload original files to Google Drive yourself. Paste its sharing URL into the gallery record. Only after opening/checking the Drive file should you select “I checked this Drive file” to mark Backup Confirmed. Saving a link alone is Backup Link Saved. A CSV manifest is available in Gallery Admin. Drive links are never public gallery delivery links.

## Estimated free allowance
The app estimates storage by summing recorded original file sizes. It can omit orphaned objects and is not Cloudflare billing data. Warning thresholds are 70%, 85% and 95% of the 10 GB-month Standard storage allowance. R2 Standard published free allowance currently includes 10 GB-month, 1m Class A and 10m Class B operations per month, with free egress; amounts beyond included allowances are billed. Infrequent Access has no free tier and retrieval charges. Review https://developers.cloudflare.com/r2/pricing/ before relying on a zero-cost estimate.

## Lifecycle
Object keys are immutable and unique. Replacement uses new keys and retains old objects. Public removal unpublishes an entry but retains R2 objects and Drive metadata; deletion from storage is a separate maintenance operation.

## Admin workflow and troubleshooting

### Upload an image or video for the public website
1. Sign in to `/admin` and open **AI Creations Gallery**.
2. In **Add media**, choose Image or Video and select a local file in the full-width R2 upload area.
3. Wait for the message **R2 objects verified**. The public delivery URL and thumbnail/poster URL are stored in the form automatically.
4. Add a title (and optionally creator/description), tick **Publish on homepage**, and press **Add gallery item**.
5. The item is eligible to appear in the homepage gallery, subject to the saved public grid capacity.

### Required Vercel environment variables
The upload API checks these values server-side:
- `R2_ACCOUNT_ID` or `R2_S3_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME=aitoolss-gallery`
- `R2_PUBLIC_BASE_URL=https://media.aitoolss.com`

Add the variables in Vercel → Project → Settings → Environment Variables for the environment you are using (Production or Preview), then redeploy that environment. Never expose either R2 credential with a `NEXT_PUBLIC_` prefix. The R2 API token must include Object Read and Object Write for the selected bucket. Configure bucket CORS to allow PUT from the website's exact origin, and connect `media.aitoolss.com` as the bucket's public custom domain.

The Gallery and Backups admin pages list missing variable names without exposing credential values. If the upload succeeds but the object check fails, verify the bucket name, endpoint/account ID and token Object Read permission. If the public URL is mismatched, check that `R2_PUBLIC_BASE_URL` exactly matches the custom domain (without an object path).

### R2 / Google Drive backups
Use **Admin Studio → R2 & Drive backups** (or `/admin/backups`). This is intentionally separate from the gallery upload form. Upload the original file manually to Google Drive, copy its HTTPS sharing URL, paste it into the matching media record and save. Select **I opened and checked this Drive file now** only after you have opened the shared file. This page stores backup references and statuses; it does not upload files to Google Drive automatically.

### Database migration order
In Supabase SQL Editor, confirm these are applied in order:
1. `202610290001_phase13_gallery_popularity.sql` (creates `gallery_items` and gallery settings).
2. `202610300001_phase14_public_customization.sql` (category metadata).
3. `202610310001_phase15_persistent_tool_catalog.sql` (tool catalogue; not a prerequisite for R2 fields but part of the site's expected schema).
4. `202610310003_r2_media_and_drive_backups.sql` (R2 object keys, storage provider, original size and Google Drive backup metadata).

The R2 migration uses `ADD COLUMN IF NOT EXISTS` and preserves existing gallery/category records. A code deployment does not run SQL migrations for you. Check the Supabase migration history and select the correct project before executing SQL.
