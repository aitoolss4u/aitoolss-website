"use client";
import { useEffect, useState } from "react";
export default function GalleryMediaInput({label="Upload image or video"}:{label?:string}) {
 const [preview,setPreview]=useState(""); const [kind,setKind]=useState<"image"|"video"|null>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 return <div style={{display:"grid",gap:8}}>
  <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>{label}
   <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={event=>{
    const file=event.target.files?.[0]; if(!file){setPreview("");setKind(null);return;}
    setPreview(URL.createObjectURL(file));setKind(file.type.startsWith("video/")?"video":"image");
   }} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}}/>
  </label>
  {preview&&<div style={{display:"grid",gap:5,maxWidth:320}}><span style={{fontSize:12,color:"#77718e"}}>Local preview — file is uploaded only after saving</span>{kind==="video"?<video src={preview} controls muted style={{width:"100%",maxHeight:220,borderRadius:12,background:"#161326"}}/>:<img src={preview} alt="Selected gallery upload preview" style={{width:"100%",maxHeight:220,objectFit:"contain",borderRadius:12,background:"#f3f0fa"}}/>}</div>}
  <small style={{fontSize:11,color:"#817891"}}>JPG, PNG, WebP, GIF, MP4 or WebM · maximum 50 MB</small>
 </div>;
}
