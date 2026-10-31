"use client";

import { useState } from "react";

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
async function upload(file:Blob,categoryId:string,variant:"original"|"optimized",name:string){
 const signedResponse=await fetch("/api/admin/r2/upload-url",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({purpose:"category",mediaType:"image",variant,categoryId,fileName:name,contentType:file.type,sizeBytes:file.size})});
 const signed=await signedResponse.json();if(!signedResponse.ok)throw new Error(signed.error||"Could not prepare image upload.");
 const uploaded=await fetch(signed.url,{method:"PUT",headers:{"Content-Type":file.type},body:file});
 if(!uploaded.ok)throw new Error("Cloudflare R2 rejected the upload ("+uploaded.status+"). Check the bucket CORS settings.");
 return signed as {key:string;publicUrl:string};
}
export default function CategoryImageManager({categoryId,imageUrl,imageAlt,imageR2Key,imageOriginalR2Key,imageOriginalSizeBytes,onChange}:{categoryId:string;imageUrl:string;imageAlt:string;imageR2Key:string;imageOriginalR2Key:string;imageOriginalSizeBytes:number;onChange:(value:ImageValues)=>void}){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [preview,setPreview]=useState("");
 async function selectFile(file:File|undefined){
  if(!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>50*1024*1024){setMessage("Choose a JPG, PNG or WebP image up to 50 MB.");return;}
  setBusy(true);setMessage("Optimizing and uploading original + WebP…");
  try{
   const optimized=await toWebp(file,1200);
   const [originalObject,optimizedObject]=await Promise.all([upload(file,categoryId,"original",file.name),upload(optimized,categoryId,"optimized",file.name.replace(/\.[^.]+$/u,"")+".webp")]);
   const checkResponse=await fetch("/api/admin/r2/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({purpose:"category",keys:[originalObject.key,optimizedObject.key]})});
   const check=await checkResponse.json();if(!checkResponse.ok||!check.verified)throw new Error(check.error||"R2 object verification failed.");
   setPreview(URL.createObjectURL(optimized));
   onChange({imageUrl:optimizedObject.publicUrl,imageAlt:imageAlt||file.name.replace(/\.[^.]+$/u,"")+" category image",imageR2Key:optimizedObject.key,imageOriginalR2Key:originalObject.key,imageOriginalSizeBytes:file.size});
   setMessage("Both R2 objects verified. Select Save changes to publish this image.");
  }catch(error){setMessage(error instanceof Error?error.message:"Category image upload failed.");}
  finally{setBusy(false);}
 }
 const remove=()=>{setPreview("");onChange({imageUrl:"",imageAlt:"",imageR2Key:"",imageOriginalR2Key:"",imageOriginalSizeBytes:0});setMessage("Default category artwork will be used after saving.");};
 return <div className="category-image-manager">
  <div className="category-image-preview">{preview||imageUrl?<img src={preview||imageUrl} alt={imageAlt||"Category image preview"}/>:<span aria-hidden="true">▧</span>}</div>
  <div className="category-image-controls">
   <label className="admin-field"><span>Category image alternative text</span><input value={imageAlt} maxLength={240} onChange={event=>onChange({imageUrl,imageAlt:event.target.value,imageR2Key,imageOriginalR2Key,imageOriginalSizeBytes})} placeholder="Describe the image"/></label>
   <label className="admin-upload-control">Upload / replace category image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>void selectFile(event.target.files?.[0])}/></label>
   <p className="admin-help-text">JPG, PNG, WebP · maximum 50 MB. Original and optimized WebP use separate R2 keys.</p>
   <div className="admin-button-row"><button type="button" className="admin-secondary" disabled={busy||(!imageUrl&&!preview)} onClick={remove}>Remove image</button><button type="button" className="admin-secondary" disabled={busy} onClick={remove}>Restore default artwork</button></div>
   {message&&<p role="status" className="admin-inline-status">{busy?"Uploading… ":""}{message}</p>}
   {imageR2Key&&<small className="admin-help-text">Optimized R2 key: {imageR2Key}</small>}
   {imageOriginalR2Key&&<small className="admin-help-text">Original R2 key: {imageOriginalR2Key} · {(imageOriginalSizeBytes/1024).toFixed(1)} KB</small>}
  </div>
 </div>;
}
