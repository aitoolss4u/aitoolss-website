"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CategoryInput = {
  id: string; name: string; slug: string; description: string;
  metaTitle: string; metaDescription: string; tags: string; imageUrl: string; visible: boolean;
};
type SettingsInput = Record<string, unknown>;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "admin") redirect("/admin-login?error=not-authorized");
  return { supabase, user };
}

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password || password.length > 1024) redirect("/admin-login?error=invalid");
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/admin-login?error=configuration"); }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin-login?error=credentials");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    redirect("/admin-login?error=not-authorized");
  }
  redirect("/admin");
}

export async function signOutAdmin() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin-login");
}

export async function loadAdminData() {
  const { supabase } = await requireAdmin();
  const [categoriesResult, settingsResult] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,tags,meta_title,meta_description,image_url,is_visible,sort_order").order("sort_order").order("name"),
    supabase.from("site_settings").select("value").eq("key", "global").maybeSingle(),
  ]);
  if (categoriesResult.error) return { ok: false as const, message: "Could not load categories. Confirm the Phase 8 SQL migration has been applied." };
  if (settingsResult.error) return { ok: false as const, message: "Could not load settings. Confirm the Phase 8 SQL migration has been applied." };
  const categories = (categoriesResult.data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    tags: (item.tags ?? []).join(", "),
    metaTitle: item.meta_title,
    metaDescription: item.meta_description,
    imageUrl: item.image_url ?? "",
    visible: item.is_visible,
  }));
  return { ok: true as const, categories, settings: (settingsResult.data?.value ?? {}) as SettingsInput };
}

function validCategory(item: CategoryInput) {
  return item && typeof item.name === "string" && item.name.trim().length > 0 && item.name.length <= 100
    && typeof item.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) && item.slug.length <= 100
    && typeof item.description === "string" && item.description.length <= 1000
    && typeof item.metaTitle === "string" && item.metaTitle.length <= 120
    && typeof item.metaDescription === "string" && item.metaDescription.length <= 320
    && typeof item.tags === "string" && item.tags.length <= 1000 && typeof item.imageUrl === "string" && item.imageUrl.length <= 2048 && (!item.imageUrl || (() => { try { return new URL(item.imageUrl).protocol === "https:"; } catch { return false; } })()) && typeof item.visible === "boolean";
}

export async function saveAdminData(payload: { categories: CategoryInput[]; settings: SettingsInput }) {
  const { supabase, user } = await requireAdmin();
  if (!payload || !Array.isArray(payload.categories) || payload.categories.length > 200 || !payload.settings || typeof payload.settings !== "object") {
    return { ok: false as const, message: "The submitted configuration is invalid." };
  }
  if (!payload.categories.every(validCategory)) return { ok: false as const, message: "Check category names, slugs, tags and metadata lengths." };
  const slugs = payload.categories.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) return { ok: false as const, message: "Category slugs must be unique." };
  const allowedSettings = ["siteName","siteDescription","defaultMetaTitle","defaultMetaDescription","primaryColor","accentColor","backgroundColor","font","maintenanceMode","showRoadmapTools","enableAnalytics","enableAds","socialFacebook","socialInstagram","socialYouTube","socialLinkedIn","socialX"];
  const settings = Object.fromEntries(allowedSettings.filter((key) => key in payload.settings).map((key) => [key, payload.settings[key]]));
  if (JSON.stringify(settings).length > 20000) return { ok: false as const, message: "Settings payload is too large." };
  const hex = /^#[0-9a-f]{6}$/i;
  for (const key of ["primaryColor","accentColor","backgroundColor"]) if (settings[key] !== undefined && (typeof settings[key] !== "string" || !hex.test(String(settings[key])))) return { ok: false as const, message: "Brand colors must be valid six-digit hex values." };
  if (settings.font !== undefined && !["Arial","Helvetica","Georgia","Verdana","Tahoma","Trebuchet MS","system-ui"].includes(String(settings.font))) return { ok: false as const, message: "Choose a supported system font." };
  for (const key of ["siteName","siteDescription","defaultMetaTitle","defaultMetaDescription"]) if (settings[key] !== undefined && (typeof settings[key] !== "string" || String(settings[key]).length > 320)) return { ok: false as const, message: "Check the length of your site and SEO text." };

  const rows = payload.categories.map((item, index) => ({
    name: item.name.trim(), slug: item.slug, description: item.description,
    tags: item.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 30),
    meta_title: item.metaTitle, meta_description: item.metaDescription, image_url: item.imageUrl || null,
    is_visible: item.visible, sort_order: (index + 1) * 10, updated_by: user.id,
  }));
  if (rows.length) {
    const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });
    if (error) return { ok: false as const, message: error.code === "23505" ? "A category slug is already in use." : "Could not save categories. Check the database migration and RLS policies." };
  }
  const deleteQuery = payload.categories.length
    ? supabase.from("categories").delete().not("slug", "in", "(" + slugs.map((slug) => '"' + slug.replaceAll('"', '') + '"').join(",") + ")")
    : supabase.from("categories").delete().neq("slug", "__no_category_should_match__");
  const { error: deleteError } = await deleteQuery;
  if (deleteError) return { ok: false as const, message: "Categories were saved, but removing deleted categories failed. Reload and retry." };

  const { error: settingsError } = await supabase.from("site_settings").upsert({
    key: "global", value: settings, updated_by: user.id, updated_at: new Date().toISOString(),
  }, { onConflict: "key" });
  if (settingsError) return { ok: false as const, message: "Categories were saved, but site settings could not be saved." };

  const publicSocial = Object.fromEntries(["socialFacebook","socialInstagram","socialX","socialLinkedIn"].map((key) => [key, typeof settings[key] === "string" ? String(settings[key]).slice(0, 500) : ""]));
  const { error: socialError } = await supabase.from("site_settings").upsert({ key: "public_social", value: publicSocial, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (socialError) return { ok: false as const, message: "Settings were saved, but public social links could not be updated. Apply the Phase 13 migration." };

  await supabase.from("admin_audit_log").insert({
    actor_id: user.id, action: "save_admin_configuration", entity_type: "site_configuration",
    details: { category_count: rows.length, settings_keys: Object.keys(settings) },
  });
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return { ok: true as const, message: "Configuration saved to Supabase." };
}
