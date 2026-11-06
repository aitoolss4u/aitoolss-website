import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatBody = { message?: unknown };

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

export async function POST(request: Request) {
  const key = process.env.AI_GATEWAY_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();

  // Fail closed: never replace a missing model/key with a template or a fake answer.
  if (!key || !model) {
    return NextResponse.json(
      { error: "AI chat is not configured yet. Add AI_GATEWAY_API_KEY and AI_MODEL to the Vercel environment, then redeploy." },
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: "You are the AIToolss assistant. Answer the user's question directly, clearly, and helpfully. Do not claim to have performed actions you cannot perform. State uncertainty when needed, and do not invent facts, sources, or tool results.",
          },
          { role: "user", content: message },
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "The AI provider could not complete this request. Check the AI Gateway model access and account configuration." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const output = data.choices?.[0]?.message?.content;
    if (typeof output !== "string" || !output.trim()) {
      return NextResponse.json(
        { error: "The AI provider returned an empty response. Please try again." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { output: output.trim(), model },
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
