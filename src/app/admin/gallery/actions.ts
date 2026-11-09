"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {getR2PublicUrl,headR2Object,isAllowedR2Key,isR2Configured} from "@/lib/r2";

async function requireAdmin(){const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user||user.app_metadata?.role!=="admin")redirect("/admin-login?error=not-authorized");return {supabase,user};}
function clean(value:FormDataEntryValue|null,max:number){return String(value??"").trim().slice(0,max);}
function validHttpsUrl(value:string){try{return new URL(value).protocol==="https:"&&value.length<=2048;}catch{return false;}}
function validDriveUrl(value:string){try{const url=new URL(value);const host=url.hostname.toLowerCase();return url.protocol==="https:"&&(host==="drive.google.com"||host.endsWith(".drive.google.com")||host==="docs.google.com"||host.endsWith(".docs.google.com"))&&url.pathname!=="/";}catch{return false;}}
function refresh(){revalidatePath("/");revalidatePath("/api/gallery");revalidatePath("/admin/gallery");revalidatePath("/admin/backups");revalidatePath("/categories");}
class MediaResolutionError extends Error{constructor(readonly code:string,message:string){super(message);this.name="MediaResolutionError";}}

async function resolveMedia(formData:FormData,mediaType:"image"|"video",submittedUrl:string,submittedThumbnail:string){
 const storageProvider=clean(formData.get("storage_provider"),20);
 const supabaseSubmittedUrl=clean(formData.get("supabase_media_url"),2048);
 if(storageProvider==="supabase"&&supabaseSubmittedUrl){
  const mediaUrl=clean(formData.get("supabase_media_url"),2048);
  const thumbnailUrl=clean(formData.get("supabase_thumbnail_url"),2048)||submittedThumbnail;
  let projectUrl=process.env.NEXT_PUBLIC_SUPABASE_URL??"";
  while(projectUrl.endsWith("/"))projectUrl=projectUrl.slice(0,-1);
  const base=projectUrl+"/storage/v1/object/public/aitoolss-gallery/";
  const allowed=mediaType==="image"?["image/jpeg","image/png","image/webp","image/gif"]:["video/mp4","video/webm"];
  if(!base.startsWith("https://")||!mediaUrl.startsWith(base))throw new MediaResolutionError("supabase-url","The Supabase public media URL does not match this project. Upload the file again.");
  if(thumbnailUrl&&!thumbnailUrl.startsWith(base))throw new MediaResolutionError("supabase-thumbnail","The thumbnail URL must belong to the AIToolss Supabase gallery bucket.");
  const originalSize=Number(formData.get("original_size_bytes")??0);
  if(!Number.isSafeInteger(originalSize)||originalSize<=0||originalSize>50*1024*1024)throw new MediaResolutionError("supabase-size","The original file is empty or exceeds the 50 MB Supabase Storage upload limit.");
  const verifyPublicObject=async(url:string,types:string[])=>{
   const response=await fetch(url,{method:"HEAD",cache:"no-store"});
   if(!response.ok)throw new Error("Object not found");
   const contentType=response.headers.get("content-type")?.split(";")[0]??"";
   if(!types.includes(contentType))throw new Error("Invalid public object type");
  };
  try{await verifyPublicObject(mediaUrl,allowed);}catch{throw new MediaResolutionError("supabase-object","The file uploaded to Supabase Storage could not be read publicly. Confirm the public bucket setup, then upload again.");}
  if(thumbnailUrl){try{await verifyPublicObject(thumbnailUrl,["image/webp","image/png"]);}catch{throw new MediaResolutionError("supabase-thumbnail","The thumbnail could not be read from the public Supabase bucket. Upload the file again.");}}
  return {media_url:mediaUrl,thumbnail_url:thumbnailUrl||null,storage_provider:"supabase",r2_object_key:null,r2_original_object_key:null,r2_thumbnail_key:null,original_file_name:clean(formData.get("original_file_name"),200),original_size_bytes:originalSize};
 }
 const r2Url=clean(formData.get("r2_media_url"),2048);
 const objectKey=clean(formData.get("r2_object_key"),512);
 const originalKey=clean(formData.get("r2_original_object_key"),512);
 const thumbUrl=clean(formData.get("r2_thumbnail_url"),2048)||submittedThumbnail;
 const thumbKey=clean(formData.get("r2_thumbnail_key"),512);
 if(r2Url||objectKey||originalKey){
  if(!isR2Configured())throw new MediaResolutionError("r2-config","Cloudflare R2 is not configured in this Vercel environment.");
  if(!r2Url||!objectKey||!originalKey||!isAllowedR2Key(objectKey,"gallery")||!isAllowedR2Key(originalKey,"gallery"))throw new MediaResolutionError("r2-details","The upload did not include valid R2 object details. Upload the file again.");
  let expectedUrl="";
  try{expectedUrl=getR2PublicUrl(objectKey);}catch{throw new MediaResolutionError("r2-config","R2_PUBLIC_BASE_URL is missing or invalid. Check the R2 environment variables.");}
  if(expectedUrl!==r2Url)throw new MediaResolutionError("r2-url","The uploaded media URL does not match the configured R2 public domain. Check R2_PUBLIC_BASE_URL and upload the file again.");
  let display,original;
  try{[display,original]=await Promise.all([headR2Object(objectKey),headR2Object(originalKey)]);}
  catch{throw new MediaResolutionError("r2-object","The uploaded object could not be found in the configured R2 bucket. Check the bucket name, endpoint and Object Read permissions, then upload again.");}
  const allowed=mediaType==="image"?["image/jpeg","image/png","image/webp","image/gif"]:["video/mp4","video/webm"];
  if(!allowed.includes(display.contentType)||!allowed.includes(original.contentType))throw new MediaResolutionError("r2-type","The stored file type does not match the selected media type. Upload an image or video of the selected type.");
  const limit=mediaType==="image"?50*1024*1024:500*1024*1024;
  if(original.size<=0||original.size>limit)throw new MediaResolutionError("r2-size","The original R2 file is empty or exceeds the upload size limit.");
  if(thumbKey){
   if(!isAllowedR2Key(thumbKey,"gallery")||!thumbUrl||getR2PublicUrl(thumbKey)!==thumbUrl)throw new MediaResolutionError("r2-thumbnail","The thumbnail URL does not match its R2 object key. Upload the file again.");
   try{const thumb=await headR2Object(thumbKey);if(thumb.contentType!=="image/webp"||thumb.size<=0)throw new Error("Invalid thumbnail");}
   catch{throw new MediaResolutionError("r2-thumbnail","The thumbnail object could not be verified in R2. Upload the file again or remove the thumbnail URL.");}
  }else if(thumbUrl&&!validHttpsUrl(thumbUrl))throw new MediaResolutionError("media-url","Enter a valid public HTTPS thumbnail URL.");
  return {media_url:r2Url,thumbnail_url:thumbUrl||null,storage_provider:"r2",r2_object_key:objectKey,r2_original_object_key:originalKey,r2_thumbnail_key:thumbKey||null,original_file_name:clean(formData.get("original_file_name"),200),original_size_bytes:original.size};
 }
 if(!validHttpsUrl(submittedUrl))throw new MediaResolutionError("media-url","Enter a valid public HTTPS media URL, or upload the file to the configured R2 bucket.");
 if(submittedThumbnail&&!validHttpsUrl(submittedThumbnail))throw new MediaResolutionError("media-url","Enter a valid public HTTPS thumbnail URL.");
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
 let media;try{media=await resolveMedia(formData,mediaType,submittedUrl,thumbnailUrl);}catch(error){
  const code=error instanceof MediaResolutionError?error.code:"r2-object";
  redirect("/admin/gallery?error="+code);
 }
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
 let media;try{media=await resolveMedia(formData,mediaType,submittedUrl,thumbnailUrl);}catch(error){
  const code=error instanceof MediaResolutionError?error.code:"r2-object";
  redirect("/admin/gallery?error="+code);
 }
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

export async function updateGalleryBackup(formData:FormData){
 const {supabase,user}=await requireAdmin();
 const id=clean(formData.get("id"),64);
 if(!/^[0-9a-f-]{36}$/i.test(id))redirect("/admin/backups?error=invalid-id");
 const {data:old,error:loadError}=await supabase.from("gallery_items").select("backup_google_drive_url,backup_status,backup_confirmed_at,backup_saved_at").eq("id",id).maybeSingle();
 if(loadError||!old)redirect("/admin/backups?error=load");
 const backup=backupInput(formData,old);
 if(!backup)redirect("/admin/backups?error=backup-url");
 const {error}=await supabase.from("gallery_items").update({...backup,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",id);
 if(error)redirect("/admin/backups?error=save");
 await supabase.from("admin_audit_log").insert({actor_id:user.id,action:"update_gallery_backup",entity_type:"gallery_item",entity_id:id,details:{backup_status:backup.backup_status}});
 refresh();
 redirect("/admin/backups?saved=updated");
}


export async function publishAllGalleryDrafts(_formData:FormData){
 const {supabase,user}=await requireAdmin();
 const {data:updated,error}=await supabase.from("gallery_items")
  .update({is_published:true,updated_by:user.id,updated_at:new Date().toISOString()})
  .eq("is_published",false)
  .select("id");
 if(error)redirect("/admin/gallery?error=publish-all");
 const publishedCount=updated?.length??0;
 await supabase.from("admin_audit_log").insert({
  actor_id:user.id,
  action:"publish_all_gallery_drafts",
  entity_type:"gallery",
  details:{published_count:publishedCount}
 });
 refresh();
 redirect("/admin/gallery?saved=published-all");
}
