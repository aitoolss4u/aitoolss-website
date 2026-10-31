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