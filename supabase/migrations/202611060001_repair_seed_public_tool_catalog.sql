-- Idempotent repair/seed for the public.tools catalogue.
-- Apply after 202610280001_phase8_admin_foundation.sql and
-- 202610310001_phase15_persistent_tool_catalog.sql.
-- Preserves existing media/category/user rows and restores all shipped tools.

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

insert into public.tools (slug,name,category,icon,description,mode,sort_order,is_active)
values
  ('text-summarizer', 'Text Summarizer', 'Writing', '✦', 'Turn long text into a concise, readable summary.', 'text', 1, true),
  ('paragraph-rewriter', 'Paragraph Rewriter', 'Writing', '↻', 'Rewrite a paragraph with clearer wording and flow.', 'text', 2, true),
  ('grammar-checklist', 'Grammar Checklist', 'Writing', '✓', 'Review common grammar and punctuation issues.', 'checklist', 3, true),
  ('headline-generator', 'Headline Generator', 'Writing', 'H', 'Draft headline ideas from a topic.', 'ideas', 4, true),
  ('blog-outline-builder', 'Blog Outline Builder', 'Writing', '☷', 'Create a structured outline for a blog post.', 'ideas', 5, true),
  ('email-draft-helper', 'Email Draft Helper', 'Writing', '✉', 'Turn notes into a clear email draft.', 'text', 6, true),
  ('tone-changer', 'Tone Changer', 'Writing', '◉', 'Adjust wording toward a selected communication tone.', 'text', 7, true),
  ('bullet-point-maker', 'Bullet Point Maker', 'Writing', '☷', 'Turn paragraphs into concise bullet points.', 'text', 8, true),
  ('reading-time-estimator', 'Reading Time Estimator', 'Writing', '◷', 'Estimate reading time from pasted text.', 'calculator', 9, true),
  ('image-compressor', 'Image Compressor', 'Images', '▧', 'Compress an image locally in your browser.', 'image', 10, true),
  ('image-dimension-checker', 'Image Dimension Checker', 'Images', '↗', 'Inspect image dimensions and file size in your browser.', 'image', 11, true),
  ('aspect-ratio-calculator', 'Aspect Ratio Calculator', 'Images', '▣', 'Calculate image aspect ratios and matching dimensions.', 'calculator', 12, true),
  ('color-palette-builder', 'Color Palette Builder', 'Images', '◈', 'Build a simple palette from a color hex value.', 'formatter', 13, true),
  ('hex-to-rgb-converter', 'Hex to RGB Converter', 'Images', '#', 'Convert hex colors to RGB and HSL values.', 'formatter', 14, true),
  ('rgb-to-hex-converter', 'RGB to Hex Converter', 'Images', '◉', 'Convert RGB color values into hexadecimal.', 'formatter', 15, true),
  ('image-alt-text-helper', 'Image Alt Text Helper', 'Images', '◎', 'Draft accessible alt-text guidance from an image description.', 'text', 16, true),
  ('filename-cleaner', 'Filename Cleaner', 'Images', '⌁', 'Create a clean, web-friendly filename.', 'formatter', 17, true),
  ('prompt-generator', 'Prompt Generator', 'Productivity', '✳', 'Turn a rough idea into a structured AI prompt.', 'ideas', 18, true),
  ('daily-planner', 'Daily Planner', 'Productivity', '◷', 'Turn tasks into a simple daily plan.', 'checklist', 19, true),
  ('goal-breakdown', 'Goal Breakdown', 'Productivity', '↗', 'Break a goal into actionable milestones.', 'checklist', 20, true),
  ('meeting-notes-formatter', 'Meeting Notes Formatter', 'Productivity', '▤', 'Organize raw meeting notes into a useful format.', 'formatter', 21, true),
  ('decision-matrix', 'Decision Matrix', 'Productivity', '⊞', 'Compare options using a weighted score table.', 'calculator', 22, true),
  ('pomodoro-session-planner', 'Pomodoro Session Planner', 'Productivity', '◴', 'Plan focused work and break intervals.', 'calculator', 23, true),
  ('habit-tracker-template', 'Habit Tracker Template', 'Productivity', '✓', 'Generate a reusable habit-tracking checklist.', 'checklist', 24, true),
  ('markdown-formatter', 'Markdown Formatter', 'Productivity', 'M', 'Normalize basic Markdown spacing and headings.', 'formatter', 25, true),
  ('code-explainer', 'Code Explainer', 'Coding', '{ }', 'Annotate common code structures and explain likely intent.', 'text', 26, true),
  ('json-formatter', 'JSON Formatter', 'Coding', '{}', 'Validate and pretty-print JSON locally.', 'json', 27, true),
  ('json-to-csv-converter', 'JSON to CSV Converter', 'Coding', '⇄', 'Convert an array of JSON objects to CSV.', 'json', 28, true),
  ('regex-cheat-sheet', 'Regex Cheat Sheet', 'Coding', ' .*', 'Create a quick reference for common regular expressions.', 'formatter', 29, true),
  ('html-entity-encoder', 'HTML Entity Encoder', 'Coding', '</>', 'Encode text for safe HTML display.', 'formatter', 30, true),
  ('url-encoder-decoder', 'URL Encoder Decoder', 'Coding', '↗', 'Encode or decode URL components.', 'formatter', 31, true),
  ('base64-encoder-decoder', 'Base64 Encoder Decoder', 'Coding', '64', 'Encode text to Base64 or decode Base64 text.', 'formatter', 32, true),
  ('slug-generator', 'Slug Generator', 'Coding', '⌁', 'Create URL-friendly slugs from titles.', 'formatter', 33, true),
  ('timestamp-converter', 'Timestamp Converter', 'Coding', '◷', 'Convert Unix timestamps and ISO date strings.', 'calculator', 34, true),
  ('wordpress-excerpt-maker', 'WordPress Excerpt Maker', 'Marketing', 'W', 'Create a short excerpt from longer content.', 'text', 35, true),
  ('social-caption-writer', 'Social Caption Writer', 'Marketing', '＠', 'Draft a social caption with a call to action.', 'text', 36, true),
  ('hashtag-ideas', 'Hashtag Ideas', 'Marketing', '#', 'Generate topic-based hashtag suggestions.', 'ideas', 37, true),
  ('meta-description-writer', 'Meta Description Writer', 'Marketing', '⌕', 'Draft a concise search snippet from page details.', 'text', 38, true),
  ('youtube-description-builder', 'YouTube Description Builder', 'Marketing', '▶', 'Structure a YouTube description with sections and links.', 'formatter', 39, true),
  ('video-script-outline', 'Video Script Outline', 'Marketing', '▷', 'Outline a short video with hook, beats and CTA.', 'ideas', 40, true),
  ('product-description-writer', 'Product Description Writer', 'Marketing', '◇', 'Turn product facts into a structured description.', 'text', 41, true),
  ('utm-link-builder', 'UTM Link Builder', 'Marketing', '↗', 'Build campaign-tagged URLs from source values.', 'formatter', 42, true),
  ('study-notes-organizer', 'Study Notes Organizer', 'Education', '▤', 'Organize study material into headings and key points.', 'formatter', 43, true),
  ('flashcard-maker', 'Flashcard Maker', 'Education', '▣', 'Turn terms and definitions into flashcards.', 'formatter', 44, true),
  ('quiz-question-builder', 'Quiz Question Builder', 'Education', '?', 'Create practice questions from supplied notes.', 'ideas', 45, true),
  ('citation-checklist', 'Citation Checklist', 'Education', '§', 'Check common elements of a source citation.', 'checklist', 46, true),
  ('essay-outline-builder', 'Essay Outline Builder', 'Education', '☷', 'Create an essay structure from a topic and thesis.', 'ideas', 47, true),
  ('vocabulary-list-maker', 'Vocabulary List Maker', 'Education', 'Aa', 'Extract unique words and build a study list.', 'formatter', 48, true),
  ('business-name-ideas', 'Business Name Ideas', 'Business', '◇', 'Explore business naming directions from keywords.', 'ideas', 49, true),
  ('swot-analysis-builder', 'SWOT Analysis Builder', 'Business', '⊞', 'Create a SWOT framework from a business idea.', 'checklist', 50, true),
  ('meeting-agenda-maker', 'Meeting Agenda Maker', 'Business', '▤', 'Turn a meeting purpose into an agenda.', 'formatter', 51, true),
  ('invoice-tax-calculator', 'Invoice Tax Calculator', 'Business', '%', 'Calculate tax and total from a subtotal and rate.', 'calculator', 52, true),
  ('break-even-calculator', 'Break-even Calculator', 'Business', '=', 'Estimate units needed to break even.', 'calculator', 53, true),
  ('resume-checklist', 'Resume Checklist', 'Career', '▣', 'Review key sections before submitting a resume.', 'checklist', 54, true),
  ('cover-letter-builder', 'Cover Letter Builder', 'Career', '✉', 'Structure a cover letter from role and experience notes.', 'formatter', 55, true),
  ('interview-practice-questions', 'Interview Practice Questions', 'Career', '?', 'Generate practice questions for a target role.', 'ideas', 56, true),
  ('achievement-bullet-rewriter', 'Achievement Bullet Rewriter', 'Career', '↗', 'Turn work notes into achievement-focused resume bullets.', 'text', 57, true),
  ('salary-hourly-converter', 'Salary Hourly Converter', 'Career', '$', 'Convert annual salary to an estimated hourly rate.', 'calculator', 58, true),
  ('random-password-generator', 'Random Password Generator', 'Productivity', '⌑', 'Generate a random password locally in your browser.', 'formatter', 59, true),
  ('pomodoro-timer', 'Pomodoro Timer', 'Productivity', '◷', 'Focus sessions with timed breaks and session tracking.', 'calculator', 60, true),
  ('ai-image-detector', 'AI Image Detector', 'Images', '◎', 'Inspect image metadata and basic pixel statistics locally; this does not verify AI provenance.', 'image', 61, true),
  ('ai-video-detector', 'AI Video Detector', 'Images', '▣', 'Inspect video metadata and sampled frames locally; this does not verify AI provenance.', 'image', 62, true),
  ('grammar-checker', 'Grammar Checker', 'Writing', '✓', 'Check spelling, grammar, punctuation and clarity.', 'text', 63, true),
  ('plagiarism-checker', 'Plagiarism Checker', 'Education', '§', 'Compare text with sources you paste using five-word phrase matching.', 'text', 64, true),
  ('ai-humanizer', 'AI Humanizer', 'Writing', '✦', 'Rewrite text naturally while preserving its meaning.', 'text', 65, true),
  ('paraphrasing-tool', 'Paraphrasing Tool', 'Writing', '↻', 'Rewrite text clearly in a selected style.', 'text', 66, true),
  ('summarizer', 'Summarizer', 'Writing', '≡', 'Summarize text into concise key points.', 'text', 67, true),
  ('word-counter', 'Word Counter', 'Writing', 'Aa', 'Count words, characters, sentences and reading time.', 'text', 68, true),
  ('translator', 'Translator', 'Education', '文', 'Translate text using a configured language provider.', 'text', 69, true),
  ('background-remover', 'Background Remover', 'Images', '▧', 'Remove plain, evenly coloured image backgrounds locally in your browser.', 'image', 70, true),
  ('ai-chatbot', 'AI Chatbot', 'Productivity', '◉', 'Chat with the configured AI model.', 'text', 71, true),
  ('dictionary', 'Dictionary', 'Education', 'Aa', 'Look up definitions and word information.', 'text', 72, true),
  ('ai-email-helper', 'AI Email Helper', 'Writing', '✉', 'Draft clear emails from your instructions.', 'text', 73, true),
  ('citation-generator', 'Citation Generator', 'Education', '¶', 'Format citations from verified or user-supplied source details.', 'text', 74, true)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  mode = excluded.mode,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
