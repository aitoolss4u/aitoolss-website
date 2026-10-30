"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const slugs = new Set(["about","privacy","terms","disclaimer","cookie-consent","contact-us"]);
export async function saveContentPage(formData:FormData) {
  const supabase=await createClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user||user.app_metadata?.role!=="admin") redirect("/admin-login?error=not-authorized");
  const slug=String(formData.get("slug")??"");
  const title=String(formData.get("title")??"").trim();
  const intro=String(formData.get("intro")??"").trim();
  const body=String(formData.get("body_markdown")??"").trim();
  const metaTitle=String(formData.get("meta_title")??"").trim();
  const metaDescription=String(formData.get("meta_description")??"").trim();
  const published=formData.get("is_published")==="on";
  if(!slugs.has(slug)||!title||title.length>160||intro.length>1000||body.length>30000||metaTitle.length>120||metaDescription.length>320) redirect("/admin/pages?error=invalid");
  const {error}=await supabase.from("content_pages").upsert({
    slug,title,intro,body_markdown:body,meta_title:metaTitle,meta_description:metaDescription,is_published:published,updated_by:user.id,updated_at:new Date().toISOString()
  },{onConflict:"slug"});
  if(error) redirect("/admin/pages?error=save");
  await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"update_content_page",entity_type:"content_page",entity_id:slug,details:{published}});
  revalidatePath("/admin/pages");
  revalidatePath("/"+slug);
  redirect("/admin/pages?saved="+slug);
}
