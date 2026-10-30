import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const allowed = new Set(["about","privacy","terms","disclaimer","cookie-consent","contact-us"]);
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!allowed.has(slug)) return NextResponse.json({ page: null }, { status: 404 });
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("content_pages").select("slug,title,intro,body_markdown,meta_title,meta_description").eq("slug",slug).eq("is_published",true).maybeSingle();
    if (error || !data) return NextResponse.json({ page: null }, { status: 404 });
    return NextResponse.json({ page: data }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch { return NextResponse.json({ page: null }, { status: 503 }); }
}
