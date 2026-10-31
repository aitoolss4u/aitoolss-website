import { NextResponse } from "next/server";
import { tools as fallbackTools } from "@/lib/tools";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tools")
      .select("name,slug,category,icon,description,mode")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ tools: fallbackTools, source: "fallback" });
    const tools = data.map((tool) => ({
      ...tool,
      label: "READY TO USE" as const,
      tags: [...new Set((tool.name + " " + tool.slug.replace(/-/g, " ") + " " + tool.category + " " + tool.description).toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1))],
      tone: tool.category === "Writing" || tool.category === "Business" ? "violet" : tool.category === "Images" || tool.category === "Coding" || tool.category === "Career" ? "cyan" : tool.category === "Marketing" || tool.category === "Education" ? "pink" : "orange",
      href: "/tools/" + tool.slug,
    }));
    return NextResponse.json({ tools, source: "supabase" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tool catalogue fallback:", error);
    return NextResponse.json({ tools: fallbackTools, source: "fallback" }, { headers: { "Cache-Control": "no-store" } });
  }
}
