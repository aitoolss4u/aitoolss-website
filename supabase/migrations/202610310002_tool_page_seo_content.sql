-- Persistent tool-specific SEO content and HTML head metadata for every catalogue row.
-- Apply after 202610310001_phase15_persistent_tool_catalog.sql.
alter table public.tools add column if not exists seo_introduction text;
alter table public.tools add column if not exists seo_what_is text;
alter table public.tools add column if not exists seo_how_to jsonb;
alter table public.tools add column if not exists seo_faqs jsonb;
alter table public.tools add column if not exists meta_title text;
alter table public.tools add column if not exists meta_description text;
alter table public.tools add column if not exists og_title text;
alter table public.tools add column if not exists og_description text;

update public.tools t set
 seo_introduction=t.name||' is designed for a specific '||lower(t.category)||' task: '||rtrim(t.description,'.')||'. It gives people working in '||lower(t.category)||' a focused place to complete that task without unrelated controls.',
 seo_what_is=t.name||' is an AIToolss '||lower(t.category)||' utility using the '||t.mode||' workflow. '||t.description||' It is intended for people who need this task in a practical workflow. Use only the controls available on the page; review outputs and verify important facts or calculations.',
 seo_how_to=case
  when t.slug='pomodoro-timer' then jsonb_build_array('Choose Focus, Short break, or Long break above the timer.','Select Start to begin the countdown; use Pause when needed.','Choose Reset to restart the current 25-, 5-, or 15-minute session. Completed focus sessions are counted on the page.')
  when t.slug='word-counter' then jsonb_build_array('Paste or type your text in the Your text field.','Read the live word, character, no-space character, and reading-time metrics.','Use Clear text to remove the input and start another count.')
  when t.slug='text-summarizer' then jsonb_build_array('Paste an article, notes, or another passage into the text field.','Choose the number of summary sentences with the Sentences selector.','Read the extractive summary and use Copy summary when it is ready.')
  when t.slug='image-compressor' then jsonb_build_array('Choose a PNG, JPEG, or WebP image with the file picker.','Adjust the Quality slider and choose WebP, JPEG, or PNG.','Select Compress image, review original and compressed sizes, then download the result.')
  when t.slug in ('ai-image-detector','ai-video-detector','plagiarism-checker','background-remover') then jsonb_build_array('Select the file or enter the text requested by the interface.','Review the provider notice: the external provider is not configured at present.','Do not treat an upload or input as an analysis result; the page will not fabricate one while the provider is unavailable.')
  when t.mode='image' then jsonb_build_array('Select the image or media file requested by the file picker.','Review file details and any provider-status notice shown on the page.','Use actions only when the interface indicates that processing is configured; review the result before saving it.')
  when t.mode='calculator' then jsonb_build_array('Enter the values requested by '||t.name||', following examples shown when available.','Select Run tool to calculate or estimate the requested result.','Check units and assumptions before using the result in a decision.')
  when t.mode='ideas' then jsonb_build_array('Enter a focused topic, audience, or brief in the input field.','Select Run tool to create a starting set of ideas or an outline.','Review suggestions and add specific facts before using them in published or professional work.')
  when t.mode='checklist' then jsonb_build_array('Enter a goal or context in the input field.','Select Run tool to build the checklist.','Work through the generated items and adapt them to your situation.')
  when t.mode='json' then jsonb_build_array('Paste a valid JSON value into the input field.','Select Run tool to format or validate the supplied data.','Review the result structure before using it in another system.')
  else jsonb_build_array('Enter the text or data required by '||t.name||' in the input field.','Select Run tool to apply the operation described on the page.','Review the output against your original input and intended use before copying it.')
 end,
 seo_faqs=jsonb_build_array(
  jsonb_build_object('question','What does '||t.name||' do?','answer',t.name||' is used to '||rtrim(t.description,'.')||'. It is listed in the '||lower(t.category)||' category on AIToolss.'),
  jsonb_build_object('question','How do I use '||t.name||'?','answer','Follow the How to Use steps on this page and use the controls displayed in the working interface.'),
  jsonb_build_object('question','What input should I provide to '||t.name||'?','answer',case when t.mode='image' then 'Choose a supported image or media file with the file picker and check the file details shown.' when t.mode='calculator' then 'Provide the numbers or values required by the calculation, including relevant units.' when t.mode='json' then 'Provide syntactically valid JSON in the structure required by the converter or formatter.' else 'Enter text, a topic, or data that directly matches this tool purpose: '||lower(t.description) end),
  jsonb_build_object('question','Does '||t.name||' process data locally?','answer',case when t.slug in ('ai-image-detector','ai-video-detector','plagiarism-checker','background-remover') then 'The required external provider is not configured at present, so the page does not return a fabricated result.' when t.slug in ('text-summarizer','paragraph-rewriter','headline-generator','blog-outline-builder','email-draft-helper','tone-changer','image-alt-text-helper','prompt-generator','code-explainer','social-caption-writer','hashtag-ideas','meta-description-writer','youtube-description-builder','video-script-outline','product-description-writer','quiz-question-builder','essay-outline-builder','business-name-ideas','interview-practice-questions','achievement-bullet-rewriter','cover-letter-builder','study-notes-organizer','flashcard-maker','meeting-agenda-maker','meeting-notes-formatter','grammar-checker','ai-humanizer','paraphrasing-tool','summarizer','translator','ai-chatbot','ai-email-helper') then 'This AI-powered tool sends submitted input from the server to its configured model provider. Do not submit passwords, private keys, or confidential personal information.' when t.slug='dictionary' then 'The entered word is sent to the dictionary endpoint to retrieve definition data.' else 'This tool performs its listed operation in the browser and does not send its input to an AI model.' end),
  jsonb_build_object('question','Can I adjust the result from '||t.name||'?','answer',case when t.slug='image-compressor' then 'Yes. The Quality slider and output-format selector control the compression settings.' when t.slug in ('text-summarizer','tone-changer','paragraph-rewriter','url-encoder-decoder','base64-encoder-decoder','html-entity-encoder','citation-generator') then 'Use the mode or format selector shown in the working interface; the available choices are specific to this tool.' else 'There is no separate settings panel for this tool; its result is determined by the input and the operation described on the page.' end),
  jsonb_build_object('question','Should I review the result from '||t.name||'?','answer','Yes. Check the output against your original input, intended use, and relevant source material. Generated text, extracted summaries, calculations, and formatted data can need human review; this tool does not guarantee factual correctness or professional suitability.')
 ),
 meta_title=t.name||' Online Tool | AIToolss',
 meta_description=t.name||': '||rtrim(t.description,'.')||'. Use the focused '||lower(t.category)||' interface on AIToolss and review the result before using it.',
 og_title=t.name||' Online Tool | AIToolss',
 og_description=t.name||': '||rtrim(t.description,'.')||'. Use the focused '||lower(t.category)||' interface on AIToolss and review the result before using it.',
 updated_at=now()
where t.is_active=true;

alter table public.tools drop constraint if exists tools_seo_faqs_six_check;
alter table public.tools add constraint tools_seo_faqs_six_check check(seo_faqs is null or case when jsonb_typeof(seo_faqs)='array' then jsonb_array_length(seo_faqs)=6 else false end);
alter table public.tools drop constraint if exists tools_seo_how_to_array_check;
alter table public.tools add constraint tools_seo_how_to_array_check check(seo_how_to is null or case when jsonb_typeof(seo_how_to)='array' then jsonb_array_length(seo_how_to)>=3 else false end);
