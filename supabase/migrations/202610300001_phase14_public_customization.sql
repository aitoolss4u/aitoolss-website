-- AIToolss public publishing, editable legal pages, category artwork and persistent gallery uploads.
-- Apply this migration in the connected Supabase project's SQL Editor before enabling these features.

alter table public.categories
  add column if not exists image_url text check (image_url is null or (char_length(image_url) <= 2048 and image_url ~ '^https://'));

create table if not exists public.content_pages (
  slug text primary key check (slug in ('about','privacy','terms','disclaimer','cookie-consent','contact-us')),
  title text not null check (char_length(title) between 1 and 160),
  intro text not null default '' check (char_length(intro) <= 1000),
  body_markdown text not null default '' check (char_length(body_markdown) <= 30000),
  meta_title text not null default '' check (char_length(meta_title) <= 120),
  meta_description text not null default '' check (char_length(meta_description) <= 320),
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.content_pages enable row level security;
drop policy if exists "Public can read published content pages" on public.content_pages;
create policy "Public can read published content pages" on public.content_pages
  for select to anon, authenticated using (is_published = true);
drop policy if exists "Admins can manage content pages" on public.content_pages;
create policy "Admins can manage content pages" on public.content_pages
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.content_pages (slug,title,intro,body_markdown,meta_title,meta_description) values
('about','About AIToolss','A practical place to discover browser-friendly tools and useful digital helpers.','## Our purpose

AIToolss brings together practical tools for writing, images, productivity, coding, marketing, education, business and career tasks.

## How the directory works

Browse categories, compare tool descriptions and open a tool page to see what it actually does. Many utilities run locally in your browser. Tools that use an external AI provider clearly send the requested input to that provider for processing.

## Our approach

We aim to describe capabilities honestly, avoid invented reviews or rankings, and make useful tools easier to discover. Availability and features may change over time.

## Contact

Questions or feedback are welcome through the Contact page or at aitoolss4u@gmail.com.','About AIToolss','Learn about the AIToolss tool directory, its practical browser-based utilities and how to contact the team.'),
('privacy','Privacy Policy','How AIToolss handles information submitted through the website.','## Information you submit

If you send a contact message, we receive the name, email address, subject and message you provide. When the email provider is configured, the message is delivered to aitoolss4u@gmail.com. The email provider and recipient mailbox may retain it.

## Tool inputs

Browser-based utilities process input locally unless a tool clearly identifies an external AI feature. When an AI feature is enabled, the text you submit is sent securely from our server to the configured model provider to generate the requested output. Do not submit sensitive or confidential information.

## Site activity

When you open a tool through a tracked selection link, we may record the tool slug and timestamp to create a recent popularity list. This event does not include your raw search text.

## Accounts and service providers

Administrative authentication and site data are handled by the configured Supabase project. Contact email delivery, when enabled, is handled by Resend. Hosting providers may process technical request logs.

## Cookies and storage

Essential browser storage may be used for core functionality and supported sign-in sessions. Optional analytics are not loaded unless an analytics provider is configured and the visitor has given the required consent.

## Retention and requests

Contact messages may remain in email systems. Database records are retained according to the configured Supabase project. For privacy requests, contact aitoolss4u@gmail.com and describe the information involved.

## Changes

We update this policy when features or providers change. This page describes the current implementation and does not promise that unconfigured services are active.','Privacy Policy | AIToolss','Read how AIToolss handles contact messages, browser-based tool inputs, site activity, cookies and service providers.'),
('terms','Terms & Conditions','Please use AIToolss lawfully and review tool outputs before relying on them.','## Using the website

AIToolss provides a tool directory and digital utilities for general informational and productivity purposes. You agree not to misuse the service, interfere with its operation, attempt unauthorized access or use the site in violation of applicable law.

## Tool output and responsibility

Tools are provided as available. Outputs may be incomplete, inaccurate or unsuitable for a particular purpose. You are responsible for reviewing results and keeping copies of important work. Do not rely on a tool output as the sole basis for a consequential decision.

## User content

You remain responsible for having the rights and permissions needed to submit, process or publish content. Do not submit unlawful, infringing or confidential material that you are not authorized to share.

## Third-party services

Listings and links may lead to services operated by other organizations. Their availability, prices, terms and privacy practices are controlled by those providers, not AIToolss.

## Availability and changes

Features may change, be suspended or be removed. We do not guarantee uninterrupted availability or a particular result.

## Contact

Questions about these terms can be sent to aitoolss4u@gmail.com.

This information is a general website notice, not legal advice. Have the terms reviewed for your business and jurisdiction before relying on them.','Terms & Conditions | AIToolss','Read the terms for using AIToolss, its browser utilities, user-submitted content and third-party links.'),
('disclaimer','Disclaimer','Important information about AI-assisted outputs, tools and third-party services.','## General information

AIToolss provides a directory and practical utilities for general informational and productivity purposes. Website content is not a guarantee of a particular outcome.

## AI-generated output

AI-generated content may contain errors, omissions, bias or outdated information. Review and independently verify important claims, calculations, citations and recommendations before using them.

## No professional advice

Tools and generated content are not a substitute for professional legal, financial, medical, tax, safety or other specialized advice.

## Third-party tools

Some listed products and services are owned and operated by third parties. A listing does not mean AIToolss owns, controls, verifies or endorses that service. Third-party providers may have separate terms, privacy policies, fees and availability.

## Availability and results

Tool availability and results may depend on the browser, device, external providers, model availability and configuration. AIToolss does not guarantee uninterrupted access, accuracy or suitability for a particular purpose.

## Contact

For questions, contact aitoolss4u@gmail.com.','Disclaimer | AIToolss','Important information about AI-generated output, independent verification, professional advice and third-party tools.'),
('cookie-consent','Cookie Policy & Consent','Manage essential storage and optional analytics preferences for this browser.','## Essential storage

Essential cookies or browser storage may support sign-in sessions, security and core site functionality. These are not optional when the related feature is used.

## Optional analytics

Optional analytics should remain disabled unless an analytics provider is configured and you have given the required consent. Saving an analytics preference alone does not mean that an analytics tracker is installed or active.

## Your choices

You can accept or reject optional analytics, or customize the preference using the controls on this page. You can reopen the page at any time to change your choice. Your preference is stored in this browser.

## Third-party services

If an optional service is enabled in the future, its provider may set or read its own cookies under its published policy. This page should be updated before such a service is activated.

## Contact

Questions about cookies and privacy can be sent to aitoolss4u@gmail.com.','Cookie Policy & Consent | AIToolss','Understand essential storage and optional analytics preferences on AIToolss and manage your browser consent.'),
('contact-us','Contact AIToolss','Send feedback, report a problem, suggest a tool or ask a question.','## Contact the team

Use the contact form on this page to send your name, email address, subject and message. When email delivery is configured, messages are routed to aitoolss4u@gmail.com; otherwise, messages are stored in the protected admin inbox.

## What to include

Describe the page or tool involved, what you expected to happen and what happened instead. Please do not include passwords, payment details or other sensitive information.

## Email

You can also reach the team at aitoolss4u@gmail.com.','Contact AIToolss','Contact AIToolss to send feedback, report an issue, suggest a tool or ask a question.')
on conflict (slug) do nothing;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('aitoolss-gallery','aitoolss-gallery',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'])
on conflict (id) do update set public=true,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Public can view AIToolss gallery media" on storage.objects;
create policy "Public can view AIToolss gallery media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'aitoolss-gallery');
drop policy if exists "Admins can upload AIToolss gallery media" on storage.objects;
create policy "Admins can upload AIToolss gallery media" on storage.objects
  for insert to authenticated with check (bucket_id = 'aitoolss-gallery' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can update AIToolss gallery media" on storage.objects;
create policy "Admins can update AIToolss gallery media" on storage.objects
  for update to authenticated using (bucket_id = 'aitoolss-gallery' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'aitoolss-gallery' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can delete AIToolss gallery media" on storage.objects;
create policy "Admins can delete AIToolss gallery media" on storage.objects
  for delete to authenticated using (bucket_id = 'aitoolss-gallery' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.get_public_site_theme()
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'siteName', coalesce(value->>'siteName','AIToolss'),
    'primaryColor', coalesce(value->>'primaryColor','#7657FF'),
    'accentColor', coalesce(value->>'accentColor','#35D9FF'),
    'backgroundColor', coalesce(value->>'backgroundColor','#FAF9FF'),
    'font', coalesce(value->>'font','Arial')
  ) from public.site_settings where key='global'
  union all
  select jsonb_build_object('siteName','AIToolss','primaryColor','#7657FF','accentColor','#35D9FF','backgroundColor','#FAF9FF','font','Arial')
  where not exists (select 1 from public.site_settings where key='global')
  limit 1;
$$;
revoke all on function public.get_public_site_theme() from public;
grant execute on function public.get_public_site_theme() to anon, authenticated;


create or replace function public.get_public_site_metadata()
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'siteName', coalesce(value->>'siteName','AIToolss'),
    'defaultMetaTitle', coalesce(value->>'defaultMetaTitle','AIToolss — Discover AI Tools That Help You Do More'),
    'defaultMetaDescription', coalesce(value->>'defaultMetaDescription','Explore useful tools for creativity, productivity, coding and everyday work.')
  ) from public.site_settings where key='global'
  union all
  select jsonb_build_object(
    'siteName','AIToolss',
    'defaultMetaTitle','AIToolss — Discover AI Tools That Help You Do More',
    'defaultMetaDescription','Explore useful tools for creativity, productivity, coding and everyday work.'
  )
  where not exists (select 1 from public.site_settings where key='global')
  limit 1;
$$;
revoke all on function public.get_public_site_metadata() from public;
grant execute on function public.get_public_site_metadata() to anon, authenticated;


create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null check (char_length(subject) between 1 and 180),
  message text not null check (char_length(message) between 1 and 8000),
  status text not null default 'new' check (status in ('new','read','archived')),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists "Visitors can submit contact messages" on public.contact_messages;
create policy "Visitors can submit contact messages" on public.contact_messages
  for insert to anon, authenticated with check (status='new');
drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages" on public.contact_messages
  for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages" on public.contact_messages
  for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;
