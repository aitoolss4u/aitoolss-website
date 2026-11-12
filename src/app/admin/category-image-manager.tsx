"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ImageValues = { imageUrl:string; imageAlt:string; imageR2Key:string; imageOriginalR2Key:string; imageOriginalSizeBytes:number };
async function toWebp(file:File,maxSize:number):Promise<Blob>{
 const url=URL.createObjectURL(file);
 try{const image=new Image();image.src=url;await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("The image could not be decoded."));});
 const scale=Math.min(1,maxSize/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement("canvas");
 canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
 const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Browser image processing is unavailable.");ctx.drawImage(image,0,0,canvas.width,canvas.height);
 return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Could not optimize this image.")),"image/webp",.84));
 }finally{URL.revokeObjectURL(url);}
}
async function uploadSupabaseVariant(file:Blob,categoryId:string,variant:"original"|"optimized",name:string){
 const supabase=createClient();
 const safeName=name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(-100)||"category-image";
 const path="categories/"+categoryId+"/"+variant+"/"+crypto.randomUUID()+"-"+safeName;
 const {data,error}=await supabase.storage.from("aitoolss-gallery").upload(path,file,{
  cacheControl:"31536000",contentType:file.type,upsert:false,
 });
 if(error)throw new Error(error.message||"Supabase Storage upload failed.");
 const {data:publicData}=supabase.storage.from("aitoolss-gallery").getPublicUrl(data.path);
 if(!publicData.publicUrl)throw new Error("Could not create the public category image URL.");
 return {path:data.path,publicUrl:publicData.publicUrl};
}
export default function CategoryImageManager({categoryId,imageUrl,imageAlt,imageR2Key,imageOriginalR2Key,imageOriginalSizeBytes,onChange}:{categoryId:string;imageUrl:string;imageAlt:string;imageR2Key:string;imageOriginalR2Key:string;imageOriginalSizeBytes:number;onChange:(value:ImageValues)=>void}){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [preview,setPreview]=useState("");
 async function selectFile(file:File|undefined){
  if(!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>50*1024*1024){setMessage("Choose a JPG, PNG or WebP image up to 50 MB.");return;}
  setBusy(true);setMessage("Optimizing image and uploading to Supabase Storage…");
  try{
   const optimized=await toWebp(file,1200);
   const [originalObject,optimizedObject]=await Promise.all([
    uploadSupabaseVariant(file,categoryId,"original",file.name),
    uploadSupabaseVariant(optimized,categoryId,"optimized",file.name.replace(/\.[^.]+$/u,"")+".webp"),
   ]);
   setPreview(URL.createObjectURL(optimized));
   onChange({imageUrl:optimizedObject.publicUrl,imageAlt:imageAlt||file.name.replace(/\.[^.]+$/u,"")+" category image",imageR2Key:"",imageOriginalR2Key:"",imageOriginalSizeBytes:file.size});
   setMessage("Original and optimized images uploaded to Supabase. Select Save changes to publish this image.");
  }catch(error){setMessage(error instanceof Error?error.message:"Category image upload failed.");}
  finally{setBusy(false);}
 }
 const remove=()=>{setPreview("");onChange({imageUrl:"",imageAlt:"",imageR2Key:"",imageOriginalR2Key:"",imageOriginalSizeBytes:0});setMessage("Default category artwork will be used after saving.");};
 return <div className="category-image-manager">
  <div className="category-image-preview">{preview||imageUrl?<img src={preview||imageUrl} alt={imageAlt||"Category image preview"}/>:<span aria-hidden="true">▧</span>}</div>
  <div className="category-image-controls">
   <label className="admin-field"><span>Category image alternative text</span><input value={imageAlt} maxLength={240} onChange={event=>onChange({imageUrl,imageAlt:event.target.value,imageR2Key,imageOriginalR2Key,imageOriginalSizeBytes})} placeholder="Describe the image"/></label>
   <label className="admin-upload-control">Upload / replace category image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>void selectFile(event.target.files?.[0])}/></label>
   <p className="admin-help-text">JPG, PNG, WebP · maximum 50 MB. Original and optimized WebP are saved in your Supabase gallery bucket.</p>
   <div className="admin-button-row"><button type="button" className="admin-secondary" disabled={busy||(!imageUrl&&!preview)} onClick={remove}>Remove image</button><button type="button" className="admin-secondary" disabled={busy} onClick={remove}>Restore default artwork</button></div>
   {message&&<p role="status" className="admin-inline-status">{busy?"Uploading… ":""}{message}</p>}
   {imageR2Key&&<small className="admin-help-text">Legacy R2 key: {imageR2Key}</small>}
   {imageOriginalR2Key&&<small className="admin-help-text">Legacy R2 original: {imageOriginalR2Key} · {(imageOriginalSizeBytes/1024).toFixed(1)} KB</small>}
  </div>
 </div>;
}
