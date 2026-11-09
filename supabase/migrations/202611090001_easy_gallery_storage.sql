-- One-step easy gallery storage setup: Supabase Storage + media metadata.
-- Run after the Phase 13 gallery migration (gallery_items must already exist).
-- Existing gallery rows and stored objects are preserved.

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

update public.gallery_items
set storage_provider = case
  when media_url like '%/storage/v1/object/public/aitoolss-gallery/%' then 'supabase'
  else 'external'
end
where storage_provider = 'external' and r2_object_key is null;

alter table public.gallery_items drop constraint if exists gallery_items_storage_provider_check;
alter table public.gallery_items add constraint gallery_items_storage_provider_check
  check (storage_provider in ('r2','supabase','external'));
alter table public.gallery_items drop constraint if exists gallery_items_backup_status_check;
alter table public.gallery_items add constraint gallery_items_backup_status_check
  check (backup_status in ('backup_pending','backup_link_saved','backup_confirmed','backup_missing'));
alter table public.gallery_items drop constraint if exists gallery_items_original_size_check;
alter table public.gallery_items add constraint gallery_items_original_size_check
  check (original_size_bytes >= 0 and original_size_bytes <= 536870912);
alter table public.categories drop constraint if exists categories_image_original_size_check;
alter table public.categories add constraint categories_image_original_size_check
  check (image_original_size_bytes >= 0 and image_original_size_bytes <= 52428800);

create index if not exists gallery_items_backup_status_idx on public.gallery_items(backup_status,created_at desc);
create index if not exists gallery_items_r2_object_key_idx on public.gallery_items(r2_object_key) where r2_object_key is not null;
create index if not exists categories_image_r2_key_idx on public.categories(image_r2_key) where image_r2_key is not null;

-- Public-read bucket: visitors may display a published media URL.
-- Upload permission remains restricted to signed-in users with trusted admin app metadata.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values (
  'aitoolss-gallery',
  'aitoolss-gallery',
  true,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "AIToolss gallery public read" on storage.objects;
create policy "AIToolss gallery public read"
on storage.objects for select
to public
using (bucket_id = 'aitoolss-gallery');

drop policy if exists "AIToolss gallery admin upload" on storage.objects;
create policy "AIToolss gallery admin upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'aitoolss-gallery'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

comment on column public.gallery_items.storage_provider is 'Public delivery provider: R2, Supabase Storage, or external HTTPS URL.';
comment on column public.gallery_items.backup_google_drive_url is 'Manual Google Drive backup reference; never use this as the public media URL.';
