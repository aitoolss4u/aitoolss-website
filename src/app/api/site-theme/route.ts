import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const HEX = /^#[0-9a-f]{6}$/i;
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_site_theme");
    if (error || !data || typeof data !== "object") return NextResponse.json({ theme: null });
    const value = data as Record<string, unknown>;
    const fonts = ["Arial","Helvetica","Georgia","Verdana","Tahoma","Trebuchet MS","system-ui"];
    return NextResponse.json({ theme: {
      siteName: typeof value.siteName === "string" ? value.siteName.slice(0,80) : "AIToolss",
      primaryColor: typeof value.primaryColor === "string" && HEX.test(value.primaryColor) ? value.primaryColor : "#7657FF",
      accentColor: typeof value.accentColor === "string" && HEX.test(value.accentColor) ? value.accentColor : "#35D9FF",
      backgroundColor: typeof value.backgroundColor === "string" && HEX.test(value.backgroundColor) ? value.backgroundColor : "#0B1020",
      font: typeof value.font === "string" && fonts.includes(value.font) ? value.font : "Arial",
    } }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch { return NextResponse.json({ theme: null }); }
}
