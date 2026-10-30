"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "admin") redirect("/admin-login?error=not-authorized");
  return { supabase, user };
}
function clean(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "").trim().slice(0, max);
}
function validHttpsUrl(value: string) {
  try { return new URL(value).protocol === "https:" && value.length <= 2048; } catch { return false; }
}
function refresh() { revalidatePath("/"); revalidatePath("/api/gallery"); revalidatePath("/admin/gallery"); }

export async function saveGalleryLayout(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const columns = Number(formData.get("columns"));
  const rows = Number(formData.get("rows"));
  if (![4,5,6].includes(columns) || ![3,4,5,6].includes(rows)) redirect("/admin/gallery?error=invalid-layout");
  const { error } = await supabase.from("site_settings").upsert({
    key: "gallery_layout", value: { columns, rows }, updated_by: user.id, updated_at: new Date().toISOString(),
  }, { onConflict: "key" });
  if (error) redirect("/admin/gallery?error=save-layout");
  await supabase.from("admin_audit_log").insert({ actor_id: user.id, action: "update_gallery_layout", entity_type: "gallery_settings", details: { columns, rows } });
  refresh();
  redirect("/admin/gallery?saved=layout");
}

export async function createGalleryItem(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const mediaType = clean(formData.get("media_type"), 10);
  const mediaUrl = clean(formData.get("media_url"), 2048);
  const thumbnailUrl = clean(formData.get("thumbnail_url"), 2048);
  const title = clean(formData.get("title"), 160);
  const description = clean(formData.get("description"), 500);
  const creator = clean(formData.get("creator"), 100);
  if (!["image","video"].includes(mediaType) || !validHttpsUrl(mediaUrl) || (thumbnailUrl && !validHttpsUrl(thumbnailUrl))) redirect("/admin/gallery?error=invalid-media");
  const { data: last } = await supabase.from("gallery_items").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("gallery_items").insert({
    media_type: mediaType, media_url: mediaUrl, thumbnail_url: thumbnailUrl || null, title, description, creator,
    is_published: formData.get("is_published") === "on", sort_order: (last?.sort_order ?? 0) + 10, updated_by: user.id,
  });
  if (error) redirect("/admin/gallery?error=create");
  await supabase.from("admin_audit_log").insert({ actor_id: user.id, action: "create_gallery_item", entity_type: "gallery_item", details: { media_type: mediaType, published: formData.get("is_published") === "on" } });
  refresh();
  redirect("/admin/gallery?saved=created");
}

export async function updateGalleryItem(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = clean(formData.get("id"), 64);
  const mediaType = clean(formData.get("media_type"), 10);
  const mediaUrl = clean(formData.get("media_url"), 2048);
  const thumbnailUrl = clean(formData.get("thumbnail_url"), 2048);
  const title = clean(formData.get("title"), 160);
  const description = clean(formData.get("description"), 500);
  const creator = clean(formData.get("creator"), 100);
  const sortOrder = Number(formData.get("sort_order"));
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["image","video"].includes(mediaType) || !validHttpsUrl(mediaUrl) || (thumbnailUrl && !validHttpsUrl(thumbnailUrl)) || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) redirect("/admin/gallery?error=invalid-media");
  const { error } = await supabase.from("gallery_items").update({
    media_type: mediaType, media_url: mediaUrl, thumbnail_url: thumbnailUrl || null, title, description, creator,
    is_published: formData.get("is_published") === "on", sort_order: sortOrder, updated_by: user.id, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) redirect("/admin/gallery?error=update");
  await supabase.from("admin_audit_log").insert({ actor_id: user.id, action: "update_gallery_item", entity_type: "gallery_item", entity_id: id, details: { media_type: mediaType, published: formData.get("is_published") === "on" } });
  refresh();
  redirect("/admin/gallery?saved=updated");
}

export async function deleteGalleryItem(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = clean(formData.get("id"), 64);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin/gallery?error=invalid-id");
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) redirect("/admin/gallery?error=delete");
  await supabase.from("admin_audit_log").insert({ actor_id: user.id, action: "delete_gallery_item", entity_type: "gallery_item", entity_id: id, details: {} });
  refresh();
  redirect("/admin/gallery?saved=deleted");
}
