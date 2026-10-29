import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", "public_social").maybeSingle();
    if (error) return NextResponse.json({ links: {} });
    const raw = (data?.value ?? {}) as Record<string, unknown>;
    const keys = ["socialFacebook", "socialInstagram", "socialX", "socialLinkedIn"];
    const links: Record<string, string> = {};
    for (const key of keys) {
      const value = typeof raw[key] === "string" ? raw[key].trim() : "";
      try {
        const url = new URL(value);
        if (url.protocol === "https:" && url.hostname !== "facebook.com" && url.hostname !== "www.facebook.com" && url.hostname !== "instagram.com" && url.hostname !== "www.instagram.com" && url.hostname !== "x.com" && url.hostname !== "www.x.com" && url.hostname !== "linkedin.com" && url.hostname !== "www.linkedin.com") links[key] = url.toString();
      } catch { /* Unconfigured URLs are intentionally omitted. */ }
    }
    return NextResponse.json({ links }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ links: {} });
  }
}
