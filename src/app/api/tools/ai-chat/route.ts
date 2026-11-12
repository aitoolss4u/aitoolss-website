import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatBody = { message?: unknown; history?: unknown };

const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_MESSAGE_LENGTH = 12_000;

function clientKey(request: Request) {
  return request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

function allowRequest(key: string) {
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (requests.size > 1_000) {
      for (const [entryKey, value] of requests) {
        if (value.resetAt <= now) requests.delete(entryKey);
      }
    }
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function extractGeminiText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const candidates = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> }).candidates;
  return candidates?.[0]?.content?.parts?.map((part) => typeof part.text === "string" ? part.text : "").join("").trim() ?? "";
}

export async function POST(request: Request) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();
  const useGemini = Boolean(geminiKey);
  const model = useGemini
    ? process.env.GEMINI_CHAT_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite"
    : process.env.AI_MODEL?.trim() || "";

  // Prefer the owner's free-tier Gemini key when configured. No template answer is ever returned.
  if (!geminiKey && (!gatewayKey || !model)) {
    return NextResponse.json(
      { error: "AI chat is not configured yet. Add GEMINI_API_KEY for the free Gemini option, or configure AI_GATEWAY_API_KEY and AI_MODEL." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const client = clientKey(request);
  if (!allowRequest(client)) {
    return NextResponse.json(
      { error: "Too many chat requests. Please wait a minute and try again." },
      { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }

  let body: ChatBody;
  try {
    body = await request.json() as ChatBody;
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Enter a message before sending it." }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Your message is too long. Keep it under 12,000 characters." }, { status: 413 });
  }
  const history = Array.isArray(body.history)
    ? body.history.slice(-10).flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const item = entry as { role?: unknown; content?: unknown };
        if ((item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string") return [];
        const content = item.content.trim().slice(0, 4_000);
        return content ? [{ role: item.role, content }] : [];
      })
    : [];
  const historyCharacters = history.reduce((sum, item) => sum + item.content.length, 0);
  if (historyCharacters > 16_000) {
    return NextResponse.json({ error: "This conversation is too long. Start a new chat to continue." }, { status: 413 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    let response: Response;
    if (useGemini) {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
        {
          method: "POST",
          headers: { "x-goog-api-key": geminiKey!, "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: "You are the AIToolss assistant. Answer the user's question directly, clearly, and helpfully. Do not claim to have performed actions you cannot perform. State uncertainty when needed, and do not invent facts, sources, or tool results." }],
            },
            contents: [
              ...history.map((item) => ({ role: item.role === "assistant" ? "model" : "user", parts: [{ text: item.content }] })),
              { role: "user", parts: [{ text: message }] },
            ],
            generationConfig: { temperature: 0.65, maxOutputTokens: 1_200, thinkingConfig: { thinkingLevel: "MINIMAL" } },
          }),
          signal: controller.signal,
          cache: "no-store",
        },
      );
    } else {
      response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + gatewayKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 800,
          messages: [
            {
              role: "system",
              content: "You are the AIToolss assistant. Answer the user's question directly, clearly, and helpfully. Do not claim to have performed actions you cannot perform. State uncertainty when needed, and do not invent facts, sources, or tool results.",
            },
            ...history.map((item) => ({ role: item.role, content: item.content })),
            { role: "user", content: message },
          ],
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "The free AI model quota is temporarily exhausted. Please wait a little and try again." },
          { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
        );
      }
      return NextResponse.json(
        { error: "The AI provider could not complete this request. Check the API key, model access and free-tier quota." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const data: unknown = await response.json();
    const output = useGemini
      ? extractGeminiText(data)
      : (data as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
    if (typeof output !== "string" || !output.trim()) {
      return NextResponse.json(
        { error: "The AI provider returned an empty response. Please try again." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { output: output.trim(), model, provider: useGemini ? "gemini" : "vercel-ai-gateway" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "The AI request timed out. Please try again." : "The AI service is temporarily unavailable. Please try again later." },
      { status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearTimeout(timeout);
  }
}
