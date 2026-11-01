import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.AI_VISION_MODEL || "alibaba/qwen3-vl-235b-a22b-instruct";
const MAX_FRAME_CHARS = 7_000_000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body?.slug;
    const frames = body?.frames;
    if (slug !== "ai-image-detector" && slug !== "ai-video-detector") {
      return NextResponse.json({ error: "Unsupported media analysis tool." }, { status: 400 });
    }
    if (!Array.isArray(frames) || frames.length < 1 || frames.length > 4 ||
      frames.some((frame) => typeof frame !== "string" || frame.length > MAX_FRAME_CHARS ||
        !/^data:image\/(jpeg|png|webp);base64,/.test(frame)) ||
      frames.reduce((total, frame) => total + (typeof frame === "string" ? frame.length : 0), 0) > 4_000_000) {
      return NextResponse.json({ error: "Upload a supported image or a video that can be sampled into up to four frames. Each frame must be under 5 MB." }, { status: 400 });
    }
    const credential = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    if (!credential) {
      return NextResponse.json({ error: "Configure AI_GATEWAY_API_KEY or enable Vercel OIDC for AI Gateway before running media analysis." }, { status: 503 });
    }
    const userPrompt = slug === "ai-image-detector"
      ? "Assess this image for visual signals that may be consistent with AI generation or editing. Report concrete observations, counter-signals, and a cautious likelihood assessment. Do not claim certainty, do not infer provenance from visual style alone, and state that image-only detection is not forensic proof."
      : "Assess these sampled video frames for visual signals that may be consistent with AI-generated or manipulated video. Discuss temporal consistency only to the extent these still frames support it, list visible clues and limitations, and state that four sampled frames cannot prove provenance or detect all manipulation.";
    const content = [{ type: "text", text: userPrompt }, ...frames.map((url) => ({ type: "image_url", image_url: { url } }))];
    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${credential}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content }],
        temperature: 0.1,
        max_tokens: 900,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("AI Gateway vision request failed", response.status, detail.slice(0, 800));
      return NextResponse.json({ error: response.status === 429 ? "AI Gateway is busy or its usage limit was reached. Try again shortly." : "AI Gateway could not analyse this media. Check your vision-model access and Gateway credits." }, { status: 502 });
    }
    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content;
    if (typeof output !== "string" || !output.trim()) {
      return NextResponse.json({ error: "The vision model returned no analysis." }, { status: 502 });
    }
    return NextResponse.json({ output: output.trim() + "\n\nImportant: This is an AI-assisted visual assessment, not a reliable forensic detector. Verify important decisions with provenance records or specialist tools.", model: MODEL }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Media analysis failed", error);
    return NextResponse.json({ error: "Media analysis failed. Check the file format and try again." }, { status: 500 });
  }
}
