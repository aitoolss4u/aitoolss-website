import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isAllowedSocialHost(key: string, host: string) {
  const hostname = host.toLowerCase().startsWith("www.") ? host.slice(4).toLowerCase() : host.toLowerCase();
  const hosts: Record<string, string[]> = { socialFacebook: ["facebook.com", "fb.com"], socialInstagram: ["instagram.com"], socialYouTube: ["youtube.com", "youtu.be"], socialX: ["x.com", "twitter.com"], socialLinkedIn: ["linkedin.com"] };
  return (hosts[key] ?? []).some((domain) => hostname === domain || hostname.endsWith("." + domain));
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", "public_social").maybeSingle();
    if (error) return NextResponse.json({ links: {} });
    const raw = (data?.value ?? {}) as Record<string, unknown>;
    const keys = ["socialFacebook", "socialInstagram", "socialYouTube", "socialX", "socialLinkedIn"];
    const links: Record<string, string> = {};
    for (const key of keys) {
      const value = typeof raw[key] === "string" ? raw[key].trim() : "";
      try {
        const url = new URL(value);
        if (url.protocol === "https:" && url.pathname !== "/" && url.pathname !== "/home" && isAllowedSocialHost(key, url.hostname)) links[key] = url.toString();
      } catch { /* Unconfigured URLs are intentionally omitted. */ }
    }
    return NextResponse.json({ links }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ links: {} });
  }
}
