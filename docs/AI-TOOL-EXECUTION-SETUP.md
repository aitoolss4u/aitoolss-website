# AI tool execution setup

Generative tools call the server-side `/api/tools/run` endpoint. That endpoint sends the tool description and visitor input to the Vercel AI Gateway using the OpenAI-compatible Chat Completions endpoint. Deterministic utilities such as counters, converters, calculators and image compression continue to run locally in the browser.

Set these server-side environment variables in Vercel for Preview and Production:

- `AI_GATEWAY_API_KEY`: create an API key in the Vercel AI Gateway dashboard. Keep it encrypted and never expose it with a `NEXT_PUBLIC_` prefix.
- `AI_MODEL`: a currently available Gateway model ID, for example `openai/gpt-5.5`. Confirm availability and account access in the AI Gateway model catalog before changing it.

AI Gateway API key setup: https://vercel.com/docs/ai-gateway/authentication-and-byok
Model catalog: https://vercel.com/ai-gateway

The server endpoint enforces an input limit, a small per-IP request limit, a bounded output size and a request timeout. The current in-memory rate limiter is a basic abuse barrier, not a distributed production rate limiter. AI output can be wrong and should be checked.

If the key or model is absent, the endpoint returns an explicit configuration error; it does not substitute template text or claim an AI result was generated.
