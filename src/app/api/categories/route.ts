import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categories as catalogCategories } from "@/lib/tools";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("name,description,image_url,sort_order,is_visible").eq("is_visible", true).order("sort_order").order("name");
    if (error || !data?.length) return NextResponse.json({ categories: catalogCategories, items: catalogCategories.map((name) => ({ name, description: "", image_url: null })) });
    const names = data.map((row) => row.name).filter((name) => catalogCategories.includes(name));
    return NextResponse.json({ categories: names.length ? names : catalogCategories, items: data.filter((row) => catalogCategories.includes(row.name)).map((row) => ({ name: row.name, description: row.description, image_url: row.image_url })) });
  } catch {
    return NextResponse.json({ categories: catalogCategories, items: catalogCategories.map((name) => ({ name, description: "", image_url: null })) });
  }
}
