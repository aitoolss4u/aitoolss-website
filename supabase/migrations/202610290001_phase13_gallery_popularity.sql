-- Phase 13: admin-managed AI gallery and privacy-conscious tool popularity.
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
create index if not exists gallery_items_published_sort_idx on public.gallery_items (is_published, sort_order, created_at desc);
alter table public.gallery_items enable row level security;
drop policy if exists "Public can read published gallery items" on public.gallery_items;
create policy "Public can read published gallery items" on public.gallery_items for select to anon, authenticated using (is_published = true);
drop policy if exists "Admins can manage gallery items" on public.gallery_items;
create policy "Admins can manage gallery items" on public.gallery_items for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.site_settings(key,value)
values ('gallery_layout','{"columns":4,"rows":4}'::jsonb)
on conflict (key) do nothing;
drop policy if exists "Public can read gallery layout" on public.site_settings;
create policy "Public can read gallery layout" on public.site_settings for select to anon, authenticated using (key = 'gallery_layout');
-- Event data stores only the selected catalog slug and timestamp, never raw search text or visitor identifiers.
create table if not exists public.tool_selection_events (
  id bigint generated always as identity primary key,
  tool_slug text not null check (tool_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(tool_slug) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists tool_selection_events_recent_idx on public.tool_selection_events (created_at desc);
create index if not exists tool_selection_events_slug_idx on public.tool_selection_events (tool_slug, created_at desc);
alter table public.tool_selection_events enable row level security;
drop policy if exists "Public can record tool selections" on public.tool_selection_events;
create policy "Public can record tool selections" on public.tool_selection_events for insert to anon, authenticated with check (tool_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
create or replace function public.get_popular_tool_slugs()
returns table(slug text, selection_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select tool_slug as slug, count(*) as selection_count
  from public.tool_selection_events
  where created_at >= now() - interval '30 days'
  group by tool_slug
  order by count(*) desc, tool_slug asc
  limit 8;
$$;
revoke all on function public.get_popular_tool_slugs() from public;
grant execute on function public.get_popular_tool_slugs() to anon, authenticated;
grant insert on public.tool_selection_events to anon, authenticated;
