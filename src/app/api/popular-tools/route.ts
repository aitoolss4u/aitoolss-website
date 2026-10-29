import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tools } from "@/lib/tools";

export const dynamic = "force-dynamic";
const knownSlugs = new Set(tools.map((tool) => tool.slug));

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_popular_tool_slugs");
    if (error || !data) return NextResponse.json({ slugs: [] });
    return NextResponse.json({ slugs: data.map((row: { slug: string }) => row.slug).filter((slug: string) => knownSlugs.has(slug)) });
  } catch {
    return NextResponse.json({ slugs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = typeof body?.slug === "string" ? body.slug : "";
    if (!knownSlugs.has(slug)) return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
    const supabase = await createClient();
    const { error } = await supabase.from("tool_selection_events").insert({ tool_slug: slug });
    if (error) return NextResponse.json({ ok: false }, { status: 503 });
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
