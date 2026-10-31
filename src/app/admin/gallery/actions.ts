"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {getR2PublicUrl,headR2Object,isAllowedR2Key} from "@/lib/r2";

async function requireAdmin(){const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user||user.app_metadata?.role!=="admin")redirect("/admin-login?error=not-authorized");return {supabase,user};}
function clean(value:FormDataEntryValue|null,max:number){return String(value??"").trim().slice(0,max);}
function validHttpsUrl(value:string){try{return new URL(value).protocol==="https:"&&value.length<=2048;}catch{return false;}}
function validDriveUrl(value:string){try{const url=new URL(value);const host=url.hostname.toLowerCase();return url.protocol==="https:"&&(host==="drive.google.com"||host.endsWith(".drive.google.com")||host==="docs.google.com"||host.endsWith(".docs.google.com"))&&url.pathname!=="/";}catch{return false;}}
function refresh(){revalidatePath("/");revalidatePath("/api/gallery");revalidatePath("/admin/gallery");revalidatePath("/categories");}

async function resolveMedia(formData:FormData,mediaType:"image"|"video",submittedUrl:string,submittedThumbnail:string){
 const r2Url=clean(formData.get("r2_media_url"),2048);
 const objectKey=clean(formData.get("r2_object_key"),512);
 const originalKey=clean(formData.get("r2_original_object_key"),512);
 const thumbUrl=clean(formData.get("r2_thumbnail_url"),2048)||submittedThumbnail;
 const thumbKey=clean(formData.get("r2_thumbnail_key"),512);
 if(r2Url||objectKey||originalKey){
  if(!r2Url||!objectKey||!originalKey||!isAllowedR2Key(objectKey,"gallery")||!isAllowedR2Key(originalKey,"gallery"))return null;
  if(getR2PublicUrl(objectKey)!==r2Url)return null;
  const [display,original]=await Promise.all([headR2Object(objectKey),headR2Object(originalKey)]);
  const allowed=mediaType==="image"?["image/jpeg","image/png","image/webp","image/gif"]:["video/mp4","video/webm"];
  if(!allowed.includes(display.contentType)||!allowed.includes(original.contentType))return null;
  const limit=mediaType==="image"?50*1024*1024:500*1024*1024;
  if(original.size<=0||original.size>limit)return null;
  if(thumbKey){
   if(!isAllowedR2Key(thumbKey,"gallery")||!thumbUrl||getR2PublicUrl(thumbKey)!==thumbUrl)return null;
   const thumb=await headR2Object(thumbKey);if(thumb.contentType!=="image/webp"||thumb.size<=0)return null;
  }else if(thumbUrl&&!validHttpsUrl(thumbUrl))return null;
  return {media_url:r2Url,thumbnail_url:thumbUrl||null,storage_provider:"r2",r2_object_key:objectKey,r2_original_object_key:originalKey,r2_thumbnail_key:thumbKey||null,original_file_name:clean(formData.get("original_file_name"),200),original_size_bytes:original.size};
 }
 if(!validHttpsUrl(submittedUrl)||(submittedThumbnail&&!validHttpsUrl(submittedThumbnail)))return null;
 return {media_url:submittedUrl,thumbnail_url:submittedThumbnail||null,storage_provider:"external",r2_object_key:null,r2_original_object_key:null,r2_thumbnail_key:null,original_file_name:"",original_size_bytes:0};
}

function backupInput(formData:FormData,old?:{backup_google_drive_url:string|null;backup_status:string;backup_confirmed_at:string|null;backup_saved_at?:string|null}){
 const url=clean(formData.get("backup_google_drive_url"),2048);
 if(url&&!validDriveUrl(url))return null;
 const requested=clean(formData.get("backup_status"),32);
 if(requested==="backup_missing"&&!url)return {backup_google_drive_url:null,backup_status:"backup_missing",backup_confirmed_at:null,backup_saved_at:null};
 if(formData.get("backup_confirmed_now")==="on"){
  if(!url)return null;
  const now=new Date().toISOString();return {backup_google_drive_url:url,backup_status:"backup_confirmed",backup_confirmed_at:now,backup_saved_at:now};
 }
 if(old&&old.backup_status==="backup_confirmed"&&old.backup_google_drive_url===url&&url){
  return {backup_google_drive_url:url,backup_status:"backup_confirmed",backup_confirmed_at:old.backup_confirmed_at,backup_saved_at:old.backup_saved_at??old.backup_confirmed_at};
 }
 if(url)return {backup_google_drive_url:url,backup_status:"backup_link_saved",backup_confirmed_at:null,backup_saved_at:new Date().toISOString()};
 return {backup_google_drive_url:null,backup_status:"backup_pending",backup_confirmed_at:null,backup_saved_at:null};
}

export async function saveGalleryLayout(formData:FormData){
 const {supabase,user}=await requireAdmin();const columns=Number(formData.get("columns")),rows=Number(formData.get("rows"));
 if(![4,5,6].includes(columns)||![3,4,5,6].includes(rows))redirect("/admin/gallery?error=invalid-layout");
 const {error}=await supabase.from("site_settings").upsert({key:"gallery_layout",value:{columns,rows},updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:"key"});
 if(error)redirect("/admin/gallery?error=save-layout");
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"update_gallery_layout",entity_type:"gallery_settings",details:{columns,rows}});
 refresh();redirect("/admin/gallery?saved=layout");
}

export async function createGalleryItem(formData:FormData){
 const {supabase,user}=await requireAdmin();
 const mediaType=clean(formData.get("media_type"),10) as "image"|"video";
 const submittedUrl=clean(formData.get("media_url"),2048),thumbnailUrl=clean(formData.get("thumbnail_url"),2048);
 const title=clean(formData.get("title"),160),description=clean(formData.get("description"),500),creator=clean(formData.get("creator"),100);
 if(!["image","video"].includes(mediaType)||(thumbnailUrl&&!validHttpsUrl(thumbnailUrl)))redirect("/admin/gallery?error=invalid-media");
 let media;try{media=await resolveMedia(formData,mediaType,submittedUrl,thumbnailUrl);}catch{media=null;}
 if(!media)redirect("/admin/gallery?error=invalid-media");
 const {data:last}=await supabase.from("gallery_items").select("sort_order").order("sort_order",{ascending:false}).limit(1).maybeSingle();
 const {error}=await supabase.from("gallery_items").insert({...media,media_type:mediaType,title,description,creator,is_published:formData.get("is_published")==="on",sort_order:(last?.sort_order??0)+10,backup_status:"backup_pending",updated_by:user.id});
 if(error)redirect("/admin/gallery?error=create");
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"create_gallery_item",entity_type:"gallery_item",details:{media_type:mediaType,storage_provider:media.storage_provider,published:formData.get("is_published")==="on"}});
 refresh();redirect("/admin/gallery?saved=created");
}

export async function updateGalleryItem(formData:FormData){
 const {supabase,user}=await requireAdmin();
 const id=clean(formData.get("id"),64),mediaType=clean(formData.get("media_type"),10) as "image"|"video";
 const submittedUrl=clean(formData.get("media_url"),2048),thumbnailUrl=clean(formData.get("thumbnail_url"),2048);
 const title=clean(formData.get("title"),160),description=clean(formData.get("description"),500),creator=clean(formData.get("creator"),100);
 const sortOrder=Number(formData.get("sort_order"));
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["image","video"].includes(mediaType)||(thumbnailUrl&&!validHttpsUrl(thumbnailUrl))||!Number.isInteger(sortOrder)||sortOrder<0||sortOrder>100000)redirect("/admin/gallery?error=invalid-media");
 const {data:old}=await supabase.from("gallery_items").select("backup_google_drive_url,backup_status,backup_confirmed_at,backup_saved_at").eq("id",id).maybeSingle();
 if(!old)redirect("/admin/gallery?error=invalid-id");
 let media;try{media=await resolveMedia(formData,mediaType,submittedUrl,thumbnailUrl);}catch{media=null;}
 if(!media)redirect("/admin/gallery?error=invalid-media");
 const backup=backupInput(formData,old);if(!backup)redirect("/admin/gallery?error=backup-url");
 const {error}=await supabase.from("gallery_items").update({...media,...backup,media_type:mediaType,title,description,creator,is_published:formData.get("is_published")==="on",sort_order:sortOrder,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",id);
 if(error)redirect("/admin/gallery?error=update");
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"update_gallery_item",entity_type:"gallery_item",entity_id:id,details:{media_type:mediaType,storage_provider:media.storage_provider,backup_status:backup.backup_status}});
 refresh();redirect("/admin/gallery?saved=updated");
}

export async function deleteGalleryItem(formData:FormData){
 const {supabase,user}=await requireAdmin();const id=clean(formData.get("id"),64);
 if(!/^[0-9a-f-]{36}$/i.test(id))redirect("/admin/gallery?error=invalid-id");
 const {error}=await supabase.from("gallery_items").update({is_published:false,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",id);
 if(error)redirect("/admin/gallery?error=delete");
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"unpublish_gallery_item",entity_type:"gallery_item",entity_id:id,details:{storage_objects_retained:true,drive_backup_retained:true}});
 refresh();redirect("/admin/gallery?saved=unpublished");
}
