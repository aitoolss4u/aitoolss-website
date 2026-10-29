import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const [{ data: items, error }, { data: layoutRow }] = await Promise.all([
      supabase.from("gallery_items").select("id,media_type,media_url,thumbnail_url,title,description,creator,sort_order").eq("is_published", true).order("sort_order").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("value").eq("key", "gallery_layout").maybeSingle(),
    ]);
    if (error) return NextResponse.json({ items: [], columns: 4, rows: 4 }, { status: 200 });
    const layout = (layoutRow?.value ?? {}) as { columns?: number; rows?: number };
    const columns = [4, 5, 6].includes(Number(layout.columns)) ? Number(layout.columns) : 4;
    const rows = [3, 4, 5, 6].includes(Number(layout.rows)) ? Number(layout.rows) : 4;
    return NextResponse.json({
      items: (items ?? []).slice(0, columns * rows).map((item) => ({
        id: item.id, type: item.media_type, url: item.media_url, thumbnail_url: item.thumbnail_url,
        title: item.title, description: item.description, creator: item.creator,
      })),
      columns, rows,
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ items: [], columns: 4, rows: 4 });
  }
}
