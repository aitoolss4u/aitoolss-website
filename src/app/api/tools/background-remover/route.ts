import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Background removal is integrated with remove.bg. Add REMOVE_BG_API_KEY in the Vercel project environment variables (the free API tier has limited monthly credits)." }, { status: 503 });
    }
    const body = await request.json();
    const image = body?.image;
    const match = typeof image === "string" ? image.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/) : null;
    if (!match || match[2].length > 4_000_000) {
      return NextResponse.json({ error: "Upload a PNG or JPEG image under 3 MB." }, { status: 400 });
    }
    const bytes = Buffer.from(match[2], "base64");
    const form = new FormData();
    form.append("image_file", new Blob([bytes], { type: `image/${match[1]}` }), "upload." + (match[1] === "jpeg" ? "jpg" : match[1]));
    form.append("size", "auto");
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("remove.bg request failed", response.status, detail.slice(0, 500));
      return NextResponse.json({ error: response.status === 402 || response.status === 429 ? "remove.bg credits or rate limit reached. Check the provider dashboard." : "remove.bg could not process this image. Check the API key and image format." }, { status: 502 });
    }
    const output = Buffer.from(await response.arrayBuffer());
    return NextResponse.json({ image: "data:image/png;base64," + output.toString("base64") }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Background removal failed", error);
    return NextResponse.json({ error: "Background removal failed. Please try another image." }, { status: 500 });
  }
}
