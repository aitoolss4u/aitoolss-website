-- Cloudflare R2 media metadata and manual Google Drive backup records.
-- Apply after existing Phase 14 and Phase 15 migrations. Existing media rows are preserved.
alter table public.categories add column if not exists image_alt text not null default '';
alter table public.categories add column if not exists image_r2_key text;
alter table public.categories add column if not exists image_original_r2_key text;
alter table public.categories add column if not exists image_original_size_bytes bigint not null default 0;
alter table public.gallery_items add column if not exists storage_provider text not null default 'external';
alter table public.gallery_items add column if not exists r2_object_key text;
alter table public.gallery_items add column if not exists r2_original_object_key text;
alter table public.gallery_items add column if not exists r2_thumbnail_key text;
alter table public.gallery_items add column if not exists original_file_name text not null default '';
alter table public.gallery_items add column if not exists original_size_bytes bigint not null default 0;
alter table public.gallery_items add column if not exists backup_google_drive_url text;
alter table public.gallery_items add column if not exists backup_status text not null default 'backup_pending';
alter table public.gallery_items add column if not exists backup_confirmed_at timestamptz;
alter table public.gallery_items add column if not exists backup_saved_at timestamptz;
update public.gallery_items set storage_provider=case when media_url like '%/storage/v1/object/public/aitoolss-gallery/%' then 'supabase' else 'external' end where storage_provider='external' and r2_object_key is null;
alter table public.gallery_items drop constraint if exists gallery_items_storage_provider_check;
alter table public.gallery_items add constraint gallery_items_storage_provider_check check(storage_provider in ('r2','supabase','external'));
alter table public.gallery_items drop constraint if exists gallery_items_backup_status_check;
alter table public.gallery_items add constraint gallery_items_backup_status_check check(backup_status in ('backup_pending','backup_link_saved','backup_confirmed','backup_missing'));
alter table public.gallery_items drop constraint if exists gallery_items_original_size_check;
alter table public.gallery_items add constraint gallery_items_original_size_check check(original_size_bytes>=0 and original_size_bytes<=536870912);
alter table public.categories drop constraint if exists categories_image_original_size_check;
alter table public.categories add constraint categories_image_original_size_check check(image_original_size_bytes>=0 and image_original_size_bytes<=52428800);
create index if not exists gallery_items_backup_status_idx on public.gallery_items(backup_status,created_at desc);
create index if not exists gallery_items_r2_object_key_idx on public.gallery_items(r2_object_key) where r2_object_key is not null;
create index if not exists categories_image_r2_key_idx on public.categories(image_r2_key) where image_r2_key is not null;
comment on column public.gallery_items.storage_provider is 'Where public media is delivered from: R2, legacy Supabase Storage, or external HTTPS URL.';
comment on column public.gallery_items.backup_google_drive_url is 'Manual Google Drive backup reference; never the public media URL.';
comment on column public.gallery_items.backup_status is 'Manual lifecycle; saved URL alone is not backup-confirmed.';
comment on column public.categories.image_r2_key is 'Optimized R2 WebP object key used by public category components.'