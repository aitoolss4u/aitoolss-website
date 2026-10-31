"use client";

import { useEffect, useState } from "react";
type UploadState={mediaUrl:string;objectKey:string;originalObjectKey:string;thumbnailUrl:string;thumbnailKey:string;fileName:string;fileSize:number;storageProvider:string};
async function uploadVariant(blob:Blob,mediaType:"image"|"video",variant:string,name:string){
 const response=await fetch("/api/admin/r2/upload-url",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({purpose:"gallery",mediaType,variant,fileName:name,contentType:blob.type,sizeBytes:blob.size})});
 const signed=await response.json();if(!response.ok)throw new Error(signed.error||"Could not prepare the R2 upload.");
 const result=await fetch(signed.url,{method:"PUT",headers:{"Content-Type":blob.type},body:blob});
 if(!result.ok)throw new Error("R2 upload failed ("+result.status+"). Check bucket CORS.");
 return signed as {key:string;publicUrl:string};
}
function imageBlob(file:File,max:number):Promise<Blob>{return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file);const image=new Image();image.onload=()=>{const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const ctx=canvas.getContext("2d");if(!ctx){URL.revokeObjectURL(url);reject(new Error("Image processing is unavailable."));return;}ctx.drawImage(image,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>{URL.revokeObjectURL(url);blob?resolve(blob):reject(new Error("Could not create WebP image."));},"image/webp",.82);};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Could not decode the image."));};image.src=url;});}
function posterBlob(file:File):Promise<Blob|null>{return new Promise(resolve=>{const url=URL.createObjectURL(file);const video=document.createElement("video");video.preload="metadata";video.muted=true;video.playsInline=true;const finish=(blob:Blob|null)=>{URL.revokeObjectURL(url);resolve(blob);};video.onloadeddata=()=>{const scale=Math.min(1,400/Math.max(video.videoWidth,video.videoHeight));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));const ctx=canvas.getContext("2d");if(!ctx){finish(null);return;}ctx.drawImage(video,0,0,canvas.width,canvas.height);canvas.toBlob(finish,"image/webp",.78);};video.onerror=()=>finish(null);video.src=url;});}
const empty:UploadState={mediaUrl:"",objectKey:"",originalObjectKey:"",thumbnailUrl:"",thumbnailKey:"",fileName:"",fileSize:0,storageProvider:"external"};
export default function GalleryMediaInput({label="Upload image or video",current}:{label?:string;current?:Partial<UploadState>}){
 const [preview,setPreview]=useState("");const [kind,setKind]=useState<"image"|"video"|null>(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 const [values,setValues]=useState<UploadState>({...empty,...current});
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 async function selectFile(file:File|undefined){
  if(!file)return;const type=file.type.startsWith("video/")?"video":file.type.startsWith("image/")?"image":null;
  if(!type||!["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm"].includes(file.type)){setMessage("Supported: JPG, PNG, WebP, GIF, MP4 or WebM.");return;}
  const limit=type==="video"?500:50;if(file.size>limit*1024*1024){setMessage("File exceeds the "+limit+" MB limit.");return;}
  setBusy(true);setKind(type);setMessage("Uploading original directly to Cloudflare R2…");if(preview)URL.revokeObjectURL(preview);setPreview(URL.createObjectURL(file));
  try{
   const original=await uploadVariant(file,type,"original",file.name);let display=original;let thumbnail:{key:string;publicUrl:string}|null=null;
   if(type==="image"&&file.type!=="image/gif"){
    display=await uploadVariant(await imageBlob(file,1200),"image","optimized",file.name.replace(/\.[^.]+$/u,"")+".webp");
    thumbnail=await uploadVariant(await imageBlob(file,400),"image","thumbnail",file.name.replace(/\.[^.]+$/u,"")+"-thumb.webp");
   }else if(type==="video"){
    const poster=await posterBlob(file);if(poster)thumbnail=await uploadVariant(poster,"video","poster",file.name.replace(/\.[^.]+$/u,"")+"-poster.webp");
   }
   const keys=[original.key,display.key,...(thumbnail?[thumbnail.key]:[])].filter((key,index,all)=>all.indexOf(key)===index);
   const checked=await fetch("/api/admin/r2/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({purpose:"gallery",keys})});
   const check=await checked.json();if(!checked.ok||!check.verified)throw new Error(check.error||"R2 objects could not be verified.");
   setValues({mediaUrl:display.publicUrl,objectKey:display.key,originalObjectKey:original.key,thumbnailUrl:thumbnail?.publicUrl??"",thumbnailKey:thumbnail?.key??"",fileName:file.name,fileSize:file.size,storageProvider:"r2"});
   setMessage("R2 objects verified. Save the gallery entry to publish. Old objects are retained after replacement.");
  }catch(error){setValues({...empty});setMessage(error instanceof Error?error.message:"R2 upload failed.");}
  finally{setBusy(false);}
 }
 return <div className="admin-r2-uploader">
  <label className="admin-upload-control">{label}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={event=>void selectFile(event.target.files?.[0])}/></label>
  {preview&&<div className="admin-media-preview">{kind==="video"?<video src={preview} controls muted playsInline preload="metadata"/>:<img src={preview} alt="Selected gallery media preview"/>}</div>}
  <p className="admin-help-text">Images: max 50 MB. Videos: max 500 MB. MP4/WebM are stored as supplied; no serverless upload proxy or paid transcoding.</p>
  {message&&<p role="status" className="admin-inline-status">{busy?"Uploading… ":""}{message}</p>}
  <input type="hidden" name="r2_media_url" value={values.mediaUrl}/><input type="hidden" name="r2_object_key" value={values.objectKey}/><input type="hidden" name="r2_original_object_key" value={values.originalObjectKey}/><input type="hidden" name="r2_thumbnail_url" value={values.thumbnailUrl}/><input type="hidden" name="r2_thumbnail_key" value={values.thumbnailKey}/><input type="hidden" name="original_file_name" value={values.fileName}/><input type="hidden" name="original_size_bytes" value={values.fileSize}/><input type="hidden" name="storage_provider" value={values.storageProvider}/>
 </div>;
}
