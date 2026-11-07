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
