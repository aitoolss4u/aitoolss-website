# AI chat execution setup

The AI chatbot uses the server-side `/api/tools/ai-chat` route. It calls Vercel AI Gateway only when both `AI_GATEWAY_API_KEY` and `AI_MODEL` are configured.

## Required configuration

Add the following as encrypted/server-only environment variables in Vercel for the environments where you intend to enable AI chat:

- `AI_GATEWAY_API_KEY`: an AI Gateway API key created by the project owner after reviewing account access and pricing.
- `AI_MODEL`: a currently available model identifier permitted by that Gateway account.

Do not add either value with a `NEXT_PUBLIC_` prefix, commit secrets, or paste keys into source code. The application does not create a key, enable a paid account, or make an AI request when the key/model is absent.

## Runtime behavior

- Missing key/model: HTTP 503 with a setup message. No template answer is returned.
- Invalid input: HTTP 400/413.
- Rate limit: 10 requests per client IP per minute per runtime instance.
- Provider timeout: 25 seconds.
- Provider failures: a generic error is returned; secret values and raw provider payloads are not exposed.

The rate limiter is process-local and is only a basic abuse barrier. Add a shared rate-limit service only after approving the service and its cost. AI responses can be incorrect; verify important information.

## Supabase catalogue prerequisite

The public tool catalogue route reads `public.tools`. If production logs report that this table is missing, apply the ordered SQL migrations in `supabase/migrations` to the connected Supabase project. In particular, apply the Phase 15 persistent catalogue migration and then the new idempotent catalogue repair migration. Applying repository migrations to Supabase is a separate database action; a GitHub push alone does not execute SQL against the database.

Vercel AI Gateway documentation: https://vercel.com/docs/ai-gateway


## AI Humanizer

The AI Humanizer is a separate server-side route at `/api/tools/humanizer`. It uses the same approved `AI_GATEWAY_API_KEY` and the Lite model falls back to `AI_MODEL`. Optional model routing can be configured with `AI_HUMANIZER_LITE_MODEL`, `AI_HUMANIZER_PRO_MODEL`, and `AI_HUMANIZER_ULTRA_MODEL`. Pro and Ultra are unavailable until their model identifiers are explicitly configured by the project owner.

The interface offers writing styles (General, Essay, Article, Report, Story, Cover letter, Marketing, Business, Legal), reading levels (General, High school, University, Doctorate, Journalist, Marketing), and rewrite strength (Quality, Balanced, Strong). The current request limit is 12,000 characters and six requests per minute per runtime instance. No model call is made when the key or selected model is absent. Configure an approved model and review its token pricing/limits before enabling it.

The tool is for readability and editorial improvement. It preserves meaning and supplied facts where possible, but users must review the rewrite. It does not generate an AI-detector score, guarantee detector results, or claim to bypass AI-detection systems.


## Free option: Google Gemini API Free Tier (preferred when configured)

The app supports direct server-to-server Gemini API calls, which do not require Vercel AI Gateway credits. Create a key in Google AI Studio and add it to Vercel as the encrypted/server-only variable `GEMINI_API_KEY`. Set `GEMINI_MODEL=gemini-3.7-flash` (the default) and `GEMINI_HUMANIZER_LITE_MODEL=gemini-3.7-flash`. The direct Gemini key takes precedence over the Gateway key for both AI chat and Humanizer.

Gemini's free tier is limited to supported models and rate limits; check the current Google AI Studio quota for the project. Google says free-tier content may be used to improve its products, so do not submit confidential, personal, or sensitive text through the free tier. If privacy requirements are stricter, use a provider/tier with suitable data protections after reviewing its terms.

The Humanizer Lite setting uses the free model configuration. Pro and Ultra require their own explicitly configured model identifiers and may not be available on the free tier. The app will report a clear setup/quota error rather than silently returning a template.

Setup links:
- Google AI Studio API keys: https://aistudio.google.com/apikey
- Gemini API pricing and free-tier details: https://ai.google.dev/gemini-api/docs/pricing
- Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits

When both Gemini and Vercel AI Gateway keys are configured, Gemini is preferred. Remove `GEMINI_API_KEY` to return to the Gateway-only route.
