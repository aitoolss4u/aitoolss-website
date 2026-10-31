-- AIToolss persistent public tool catalogue.
-- Apply in Supabase SQL Editor after the Phase 8 admin foundation migration.

create table if not exists public.tools (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 80),
  icon text not null default '✦',
  description text not null default '' check (char_length(description) <= 1000),
  mode text not null check (mode in ('text','ideas','checklist','calculator','formatter','json','image')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index if not exists tools_public_order_idx on public.tools (is_active, sort_order);
alter table public.tools enable row level security;
drop policy if exists "Public can read active tools" on public.tools;
create policy "Public can read active tools" on public.tools
  for select to anon, authenticated using (is_active = true);
drop policy if exists "Admins can manage tools" on public.tools;
create policy "Admins can manage tools" on public.tools
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.tools (name,slug,category,icon,description,mode,sort_order)
values
  ('Text Summarizer', 'text-summarizer', 'Writing', '✦', 'Turn long text into a concise, readable summary.', 'text', 1),
  ('Paragraph Rewriter', 'paragraph-rewriter', 'Writing', '↻', 'Rewrite a paragraph with clearer wording and flow.', 'text', 2),
  ('Grammar Checklist', 'grammar-checklist', 'Writing', '✓', 'Review common grammar and punctuation issues.', 'checklist', 3),
  ('Headline Generator', 'headline-generator', 'Writing', 'H', 'Draft headline ideas from a topic.', 'ideas', 4),
  ('Blog Outline Builder', 'blog-outline-builder', 'Writing', '☷', 'Create a structured outline for a blog post.', 'ideas', 5),
  ('Email Draft Helper', 'email-draft-helper', 'Writing', '✉', 'Turn notes into a clear email draft.', 'text', 6),
  ('Tone Changer', 'tone-changer', 'Writing', '◉', 'Adjust wording toward a selected communication tone.', 'text', 7),
  ('Bullet Point Maker', 'bullet-point-maker', 'Writing', '☷', 'Turn paragraphs into concise bullet points.', 'text', 8),
  ('Reading Time Estimator', 'reading-time-estimator', 'Writing', '◷', 'Estimate reading time from pasted text.', 'calculator', 9),
  ('Image Compressor', 'image-compressor', 'Images', '▧', 'Compress an image locally in your browser.', 'image', 10),
  ('Image Dimension Checker', 'image-dimension-checker', 'Images', '↗', 'Inspect image dimensions and file size in your browser.', 'image', 11),
  ('Aspect Ratio Calculator', 'aspect-ratio-calculator', 'Images', '▣', 'Calculate image aspect ratios and matching dimensions.', 'calculator', 12),
  ('Color Palette Builder', 'color-palette-builder', 'Images', '◈', 'Build a simple palette from a color hex value.', 'formatter', 13),
  ('Hex to RGB Converter', 'hex-to-rgb-converter', 'Images', '#', 'Convert hex colors to RGB and HSL values.', 'formatter', 14),
  ('RGB to Hex Converter', 'rgb-to-hex-converter', 'Images', '◉', 'Convert RGB color values into hexadecimal.', 'formatter', 15),
  ('Image Alt Text Helper', 'image-alt-text-helper', 'Images', '◎', 'Draft accessible alt-text guidance from an image description.', 'text', 16),
  ('Filename Cleaner', 'filename-cleaner', 'Images', '⌁', 'Create a clean, web-friendly filename.', 'formatter', 17),
  ('Prompt Generator', 'prompt-generator', 'Productivity', '✳', 'Turn a rough idea into a structured AI prompt.', 'ideas', 18),
  ('Daily Planner', 'daily-planner', 'Productivity', '◷', 'Turn tasks into a simple daily plan.', 'checklist', 19),
  ('Goal Breakdown', 'goal-breakdown', 'Productivity', '↗', 'Break a goal into actionable milestones.', 'checklist', 20),
  ('Meeting Notes Formatter', 'meeting-notes-formatter', 'Productivity', '▤', 'Organize raw meeting notes into a useful format.', 'formatter', 21),
  ('Decision Matrix', 'decision-matrix', 'Productivity', '⊞', 'Compare options using a weighted score table.', 'calculator', 22),
  ('Pomodoro Session Planner', 'pomodoro-session-planner', 'Productivity', '◴', 'Plan focused work and break intervals.', 'calculator', 23),
  ('Habit Tracker Template', 'habit-tracker-template', 'Productivity', '✓', 'Generate a reusable habit-tracking checklist.', 'checklist', 24),
  ('Markdown Formatter', 'markdown-formatter', 'Productivity', 'M', 'Normalize basic Markdown spacing and headings.', 'formatter', 25),
  ('Code Explainer', 'code-explainer', 'Coding', '{ }', 'Annotate common code structures and explain likely intent.', 'text', 26),
  ('JSON Formatter', 'json-formatter', 'Coding', '{}', 'Validate and pretty-print JSON locally.', 'json', 27),
  ('JSON to CSV Converter', 'json-to-csv-converter', 'Coding', '⇄', 'Convert an array of JSON objects to CSV.', 'json', 28),
  ('Regex Cheat Sheet', 'regex-cheat-sheet', 'Coding', ' .*', 'Create a quick reference for common regular expressions.', 'formatter', 29),
  ('HTML Entity Encoder', 'html-entity-encoder', 'Coding', '</>', 'Encode text for safe HTML display.', 'formatter', 30),
  ('URL Encoder Decoder', 'url-encoder-decoder', 'Coding', '↗', 'Encode or decode URL components.', 'formatter', 31),
  ('Base64 Encoder Decoder', 'base64-encoder-decoder', 'Coding', '64', 'Encode text to Base64 or decode Base64 text.', 'formatter', 32),
  ('Slug Generator', 'slug-generator', 'Coding', '⌁', 'Create URL-friendly slugs from titles.', 'formatter', 33),
  ('Timestamp Converter', 'timestamp-converter', 'Coding', '◷', 'Convert Unix timestamps and ISO date strings.', 'calculator', 34),
  ('WordPress Excerpt Maker', 'wordpress-excerpt-maker', 'Marketing', 'W', 'Create a short excerpt from longer content.', 'text', 35),
  ('Social Caption Writer', 'social-caption-writer', 'Marketing', '＠', 'Draft a social caption with a call to action.', 'text', 36),
  ('Hashtag Ideas', 'hashtag-ideas', 'Marketing', '#', 'Generate topic-based hashtag suggestions.', 'ideas', 37),
  ('Meta Description Writer', 'meta-description-writer', 'Marketing', '⌕', 'Draft a concise search snippet from page details.', 'text', 38),
  ('YouTube Description Builder', 'youtube-description-builder', 'Marketing', '▶', 'Structure a YouTube description with sections and links.', 'formatter', 39),
  ('Video Script Outline', 'video-script-outline', 'Marketing', '▷', 'Outline a short video with hook, beats and CTA.', 'ideas', 40),
  ('Product Description Writer', 'product-description-writer', 'Marketing', '◇', 'Turn product facts into a structured description.', 'text', 41),
  ('UTM Link Builder', 'utm-link-builder', 'Marketing', '↗', 'Build campaign-tagged URLs from source values.', 'formatter', 42),
  ('Study Notes Organizer', 'study-notes-organizer', 'Education', '▤', 'Organize study material into headings and key points.', 'formatter', 43),
  ('Flashcard Maker', 'flashcard-maker', 'Education', '▣', 'Turn terms and definitions into flashcards.', 'formatter', 44),
  ('Quiz Question Builder', 'quiz-question-builder', 'Education', '?', 'Create practice questions from supplied notes.', 'ideas', 45),
  ('Citation Checklist', 'citation-checklist', 'Education', '§', 'Check common elements of a source citation.', 'checklist', 46),
  ('Essay Outline Builder', 'essay-outline-builder', 'Education', '☷', 'Create an essay structure from a topic and thesis.', 'ideas', 47),
  ('Vocabulary List Maker', 'vocabulary-list-maker', 'Education', 'Aa', 'Extract unique words and build a study list.', 'formatter', 48),
  ('Business Name Ideas', 'business-name-ideas', 'Business', '◇', 'Explore business naming directions from keywords.', 'ideas', 49),
  ('SWOT Analysis Builder', 'swot-analysis-builder', 'Business', '⊞', 'Create a SWOT framework from a business idea.', 'checklist', 50),
  ('Meeting Agenda Maker', 'meeting-agenda-maker', 'Business', '▤', 'Turn a meeting purpose into an agenda.', 'formatter', 51),
  ('Invoice Tax Calculator', 'invoice-tax-calculator', 'Business', '%', 'Calculate tax and total from a subtotal and rate.', 'calculator', 52),
  ('Break-even Calculator', 'break-even-calculator', 'Business', '=', 'Estimate units needed to break even.', 'calculator', 53),
  ('Resume Checklist', 'resume-checklist', 'Career', '▣', 'Review key sections before submitting a resume.', 'checklist', 54),
  ('Cover Letter Builder', 'cover-letter-builder', 'Career', '✉', 'Structure a cover letter from role and experience notes.', 'formatter', 55),
  ('Interview Practice Questions', 'interview-practice-questions', 'Career', '?', 'Generate practice questions for a target role.', 'ideas', 56),
  ('Achievement Bullet Rewriter', 'achievement-bullet-rewriter', 'Career', '↗', 'Turn work notes into achievement-focused resume bullets.', 'text', 57),
  ('Salary Hourly Converter', 'salary-hourly-converter', 'Career', '$', 'Convert annual salary to an estimated hourly rate.', 'calculator', 58),
  ('Random Password Generator', 'random-password-generator', 'Productivity', '⌑', 'Generate a random password locally in your browser.', 'formatter', 59),
  ('Pomodoro Timer', 'pomodoro-timer', 'Productivity', '◷', 'Focus sessions with timed breaks and session tracking.', 'calculator', 60),
  ('AI Image Detector', 'ai-image-detector', 'Images', '◎', 'Assess an image with a configured AI-image detection provider.', 'image', 61),
  ('AI Video Detector', 'ai-video-detector', 'Images', '▣', 'Analyse video frames with a configured video-detection provider.', 'image', 62),
  ('Grammar Checker', 'grammar-checker', 'Writing', '✓', 'Check spelling, grammar, punctuation and clarity.', 'text', 63),
  ('Plagiarism Checker', 'plagiarism-checker', 'Education', '§', 'Compare text against sources through a configured plagiarism provider.', 'text', 64),
  ('AI Humanizer', 'ai-humanizer', 'Writing', '✦', 'Rewrite text naturally while preserving its meaning.', 'text', 65),
  ('Paraphrasing Tool', 'paraphrasing-tool', 'Writing', '↻', 'Rewrite text clearly in a selected style.', 'text', 66),
  ('Summarizer', 'summarizer', 'Writing', '≡', 'Summarize text into concise key points.', 'text', 67),
  ('Word Counter', 'word-counter', 'Writing', 'Aa', 'Count words, characters, sentences and reading time.', 'text', 68),
  ('Translator', 'translator', 'Education', '文', 'Translate text using a configured language provider.', 'text', 69),
  ('Background Remover', 'background-remover', 'Images', '▧', 'Remove image backgrounds with a configured image-processing provider.', 'image', 70),
  ('AI Chatbot', 'ai-chatbot', 'Productivity', '◉', 'Chat with the configured AI model.', 'text', 71),
  ('Dictionary', 'dictionary', 'Education', 'Aa', 'Look up definitions and word information.', 'text', 72),
  ('AI Email Helper', 'ai-email-helper', 'Writing', '✉', 'Draft clear emails from your instructions.', 'text', 73),
  ('Citation Generator', 'citation-generator', 'Education', '¶', 'Format citations from verified or user-supplied source details.', 'text', 74)
on conflict (slug) do update set
  name=excluded.name, category=excluded.category, icon=excluded.icon,
  description=excluded.description, mode=excluded.mode, sort_order=excluded.sort_order,
  updated_at=now();
