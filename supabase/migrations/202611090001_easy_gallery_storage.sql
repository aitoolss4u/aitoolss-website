-- AIToolss self-contained gallery bootstrap.
-- This script may be run even when Phase 8 / Phase 13 have not been applied.
-- Every table/policy/index uses IF NOT EXISTS or DROP POLICY + CREATE POLICY.
-- Existing records and Storage objects are preserved.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{0,63}$'),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 1000),
  tags text[] not null default '{}',
  meta_title text not null default '' check (char_length(meta_title) <= 120),
  meta_description text not null default '' check (char_length(meta_description) <= 320),
  image_url text check (image_url is null or (char_length(image_url) <= 2048 and image_url ~ '^https://')),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 1 and 80),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- This is the base table from the repository's Phase 13 Gallery migration.
-- Creating it here makes this one-time setup work in a project where Phase 13
-- was not previously applied.
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_type text not null check (media_type in ('image','video')),
  media_url text not null check (char_length(media_url) <= 2048 and media_url ~ '^https://'),
  thumbnail_url text check (thumbnail_url is null or (char_length(thumbnail_url) <= 2048 and thumbnail_url ~ '^https://')),
  title text not null default '' check (char_length(title) <= 160),
  description text not null default '' check (char_length(description) <= 500),
  creator text not null default '' check (char_length(creator) <= 100),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists categories_visible_sort_idx on public.categories(is_visible, sort_order);
create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log(created_at desc);
create index if not exists gallery_items_published_sort_idx on public.gallery_items(is_published, sort_order, created_at desc);

alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.gallery_items enable row level security;

drop policy if exists "Public can read visible categories" on public.categories;
create policy "Public can read visible categories" on public.categories
  for select to anon, authenticated using (is_visible = true);
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read site settings" on public.site_settings;
create policy "Admins can read site settings" on public.site_settings
  for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Public can read gallery layout" on public.site_settings;
create policy "Public can read gallery layout" on public.site_settings
  for select to anon, authenticated using (key = 'gallery_layout');
drop policy if exists "Public can read configured social links" on public.site_settings;
create policy "Public can read configured social links" on public.site_settings
  for select to anon, authenticated using (key = 'public_social');

drop policy if exists "Admins can read audit log" on public.admin_audit_log;
create policy "Admins can read audit log" on public.admin_audit_log
  for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can insert audit log" on public.admin_audit_log;
create policy "Admins can insert audit log" on public.admin_audit_log
  for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can read published gallery items" on public.gallery_items;
create policy "Public can read published gallery items" on public.gallery_items
  for select to anon, authenticated using (is_published = true);
drop policy if exists "Admins can manage gallery items" on public.gallery_items;
create policy "Admins can manage gallery items" on public.gallery_items
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant select, insert on public.admin_audit_log to authenticated;
grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;

insert into public.categories (name, slug, description, tags, meta_title, meta_description, sort_order)
values
  ('Writing','writing','AI tools for writing, editing and content creation.',array['writing','content','editing'],'Best AI Writing Tools | AIToolss','Explore AI writing tools for content creation, editing, rewriting and everyday writing.',10),
  ('Images','images','AI tools for image generation and editing.',array['images','design','art'],'AI Image Tools | AIToolss','Discover AI image tools for creating, editing and enhancing visual content.',20),
  ('Productivity','productivity','Tools to make everyday work more efficient.',array['productivity','workflow','work'],'AI Productivity Tools | AIToolss','Find AI productivity tools for workflows, planning, summaries and everyday work.',30),
  ('Coding','coding','AI tools for developers and software teams.',array['coding','developer','programming'],'AI Coding Tools | AIToolss','Explore AI coding tools for developers, debugging, code generation and software workflows.',40),
  ('Marketing','marketing','AI tools for marketing, SEO and growth.',array['marketing','seo','growth'],'AI Marketing Tools | AIToolss','Find AI marketing tools for SEO, campaigns, research and audience growth.',50),
  ('Education','education','AI tools for learning, teaching and research.',array['education','learning','research'],'AI Education Tools | AIToolss','Discover AI tools for students, educators, learning and research.',60),
  ('Business','business','AI tools for business operations and teams.',array['business','operations','teams'],'AI Business Tools | AIToolss','Explore AI tools for business operations, team productivity and decision support.',70),
  ('Career','career','AI tools for resumes, interviews and career growth.',array['career','resume','interview'],'AI Career Tools | AIToolss','Find AI career tools for resumes, interview practice and professional growth.',80)
on conflict (slug) do nothing;

insert into public.site_settings(key,value)
values ('gallery_layout','{"columns":4,"rows":4}'::jsonb),('public_social','{}'::jsonb)
on conflict (key) do nothing;

-- Keep the Phase 13 privacy-conscious popularity data/function available too.
create table if not exists public.tool_selection_events (
  id bigint generated always as identity primary key,
  tool_slug text not null check (tool_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(tool_slug) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists tool_selection_events_recent_idx on public.tool_selection_events(created_at desc);
create index if not exists tool_selection_events_slug_idx on public.tool_selection_events(tool_slug, created_at desc);
alter table public.tool_selection_events enable row level security;
drop policy if exists "Public can record tool selections" on public.tool_selection_events;
create policy "Public can record tool selections" on public.tool_selection_events
  for insert to anon, authenticated with check (tool_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
grant insert on public.tool_selection_events to anon, authenticated;

create or replace function public.get_popular_tool_slugs()
returns table(slug text, selection_count bigint)
language sql stable security definer set search_path=public as $$
  select tool_slug as slug, count(*) as selection_count
  from public.tool_selection_events
  where created_at >= now() - interval '30 days'
  group by tool_slug
  order by count(*) desc, tool_slug asc
  limit 8;
$$;
revoke all on function public.get_popular_tool_slugs() from public;
grant execute on function public.get_popular_tool_slugs() to anon, authenticated;

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
