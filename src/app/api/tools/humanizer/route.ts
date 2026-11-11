import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 12_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 6;
const requests = new Map<string, { count: number; resetAt: number }>();

const modelLevels = ["lite", "pro", "ultra"] as const;
const writingStyles = ["general", "essay", "article", "report", "story", "cover-letter", "marketing", "business", "legal"] as const;
const readingLevels = ["general", "high-school", "university", "doctorate", "journalist", "marketing"] as const;
const strengths = ["quality", "balanced", "strong"] as const;

type HumanizerSettings = {
  modelLevel?: unknown;
  style?: unknown;
  readingLevel?: unknown;
  strength?: unknown;
};
type RequestBody = { text?: unknown; settings?: HumanizerSettings };

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

function gatewayModel(level: typeof modelLevels[number]) {
  if (level === "pro") return process.env.AI_HUMANIZER_PRO_MODEL?.trim() || "";
  if (level === "ultra") return process.env.AI_HUMANIZER_ULTRA_MODEL?.trim() || "";
  return process.env.AI_HUMANIZER_LITE_MODEL?.trim() || process.env.AI_MODEL?.trim() || "";
}

function geminiModel(level: typeof modelLevels[number]) {
  if (level === "pro") return process.env.GEMINI_HUMANIZER_PRO_MODEL?.trim() || "";
  if (level === "ultra") return process.env.GEMINI_HUMANIZER_ULTRA_MODEL?.trim() || "";
  return process.env.GEMINI_HUMANIZER_LITE_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
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

  if (!geminiKey && !gatewayKey) {
    return NextResponse.json(
      { error: "AI Humanizer is not configured yet. Add a server-only GEMINI_API_KEY in Vercel to enable the free Gemini API option. No AI Gateway billing or credit card is required for this path." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!allowRequest(clientKey(request))) {
    return NextResponse.json(
      { error: "You have reached the short-term rewrite limit. Please wait a minute and try again." },
      { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Paste the text you want to improve." }, { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "This version supports up to 12,000 characters per rewrite." }, { status: 413 });
  }

  const settings = body.settings ?? {};
  const modelLevel = modelLevels.find((item) => item === settings.modelLevel) ?? "lite";
  const style = writingStyles.find((item) => item === settings.style) ?? "general";
  const readingLevel = readingLevels.find((item) => item === settings.readingLevel) ?? "general";
  const strength = strengths.find((item) => item === settings.strength) ?? "balanced";
  const model = useGemini ? geminiModel(modelLevel) : gatewayModel(modelLevel);

  if (!model) {
    const label = modelLevel === "pro" ? "Pro" : modelLevel === "ultra" ? "Ultra" : "Lite";
    return NextResponse.json(
      { error: label + " model is not configured. The free Gemini setup supports Lite by default; select Lite or ask the site owner to configure another model." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const styleLabel = style === "cover-letter" ? "cover letter" : style;
  const levelLabel = readingLevel === "high-school" ? "high-school" : readingLevel;
  const strengthInstructions = {
    quality: "Make a light editorial pass. Stay close to the original structure and wording; improve clarity, grammar and flow without unnecessary changes.",
    balanced: "Make a balanced rewrite. Improve sentence rhythm, transitions, clarity and word choice while retaining the original structure and all intended meaning.",
    strong: "Make a more substantial editorial rewrite. Rework sentence structures and paragraph flow where helpful, but preserve every factual claim, qualification, figure, name, citation and the author's intended meaning.",
  }[strength];
  const systemPrompt = [
    "You are an expert human editor. Improve the supplied text so it reads clearly, naturally and appropriately for its intended audience.",
    "This is an editorial rewrite task, not an AI-detection evasion task. Never promise or optimize for bypassing AI detectors.",
    "Preserve the author's meaning, point of view, factual claims, uncertainty, names, dates, numbers, quotations, citations and technical details. Never invent evidence, examples, sources or experiences.",
    "Keep the same language as the source text. Do not translate unless the user explicitly asks within the source text.",
    "Respect the selected writing style and reading level without changing the underlying facts.",
    "Return only the rewritten text. Do not add an introduction, explanation, markdown fence, score or claim that the text is human-written.",
  ].join(" ");
  const userPrompt = [
    "Writing style: " + styleLabel,
    "Target reading level: " + levelLabel,
    "Rewrite strength: " + strength + ". " + strengthInstructions,
    "Rewrite the text below. Preserve paragraphs and lists where practical.",
    "<source_text>",
    text,
    "</source_text>",
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40_000);
  try {
    let response: Response;
    if (useGemini) {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
        {
          method: "POST",
          headers: { "x-goog-api-key": geminiKey!, "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: strength === "quality" ? 0.35 : strength === "strong" ? 0.75 : 0.55,
              maxOutputTokens: 5_000,
            },
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
          temperature: strength === "quality" ? 0.35 : strength === "strong" ? 0.75 : 0.55,
          max_tokens: 5_000,
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "The free model quota is temporarily exhausted. Please wait and try again later." },
          { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
        );
      }
      return NextResponse.json(
        { error: "The configured AI model could not complete this rewrite. Check the API key, model access and free-tier availability." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const data: unknown = await response.json();
    const output = useGemini
      ? extractGeminiText(data)
      : ((data as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content);
    if (typeof output !== "string" || !output.trim()) {
      return NextResponse.json(
        { error: "The AI provider returned an empty rewrite. Please try again." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { output: output.trim(), modelLevel, model, provider: useGemini ? "gemini" : "vercel-ai-gateway", style, readingLevel, strength, inputWords: text.split(/\s+/).length },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "The rewrite took too long. Try a shorter passage or try again." : "The AI service is temporarily unavailable. Please try again later." },
      { status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearTimeout(timeout);
  }
}
