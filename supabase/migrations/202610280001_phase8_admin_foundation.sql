-- AIToolss Phase 8: persistent admin-managed directory configuration.
-- Run in the Supabase SQL Editor after creating a project.
-- No service-role key is needed by the application. RLS is enabled on every table.

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

create index if not exists categories_visible_sort_idx on public.categories (is_visible, sort_order);
create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.admin_audit_log enable row level security;

-- Public visitors can read only visible categories. Only app_metadata.role=admin can write.
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
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read audit log" on public.admin_audit_log;
create policy "Admins can read audit log" on public.admin_audit_log
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can insert audit log" on public.admin_audit_log;
create policy "Admins can insert audit log" on public.admin_audit_log
  for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed starter categories idempotently; public UI integration is a later step.
insert into public.categories (name, slug, description, tags, meta_title, meta_description, sort_order)
values
  ('Writing', 'writing', 'AI tools for writing, editing and content creation.', array['writing','content','editing'], 'Best AI Writing Tools | AIToolss', 'Explore AI writing tools for content creation, editing, rewriting and everyday writing.', 10),
  ('Images', 'images', 'AI tools for image generation and editing.', array['images','design','art'], 'AI Image Tools | AIToolss', 'Discover AI image tools for creating, editing and enhancing visual content.', 20),
  ('Productivity', 'productivity', 'Tools to make everyday work more efficient.', array['productivity','workflow','work'], 'AI Productivity Tools | AIToolss', 'Find AI productivity tools for workflows, planning, summaries and everyday work.', 30),
  ('Coding', 'coding', 'AI tools for developers and software teams.', array['coding','developer','programming'], 'AI Coding Tools | AIToolss', 'Explore AI coding tools for developers, debugging, code generation and software workflows.', 40),
  ('Marketing', 'marketing', 'AI tools for marketing, SEO and growth.', array['marketing','seo','growth'], 'AI Marketing Tools | AIToolss', 'Find AI marketing tools for SEO, campaigns, research and audience growth.', 50),
  ('Education', 'education', 'AI tools for learning, teaching and research.', array['education','learning','research'], 'AI Education Tools | AIToolss', 'Discover AI tools for students, educators, learning and research.', 60),
  ('Business', 'business', 'AI tools for business operations and teams.', array['business','operations','teams'], 'AI Business Tools | AIToolss', 'Explore AI tools for business operations, team productivity and decision support.', 70),
  ('Career', 'career', 'AI tools for resumes, interviews and career growth.', array['career','resume','interview'], 'AI Career Tools | AIToolss', 'Find AI career tools for resumes, interview practice and professional growth.', 80)
on conflict (slug) do nothing;
