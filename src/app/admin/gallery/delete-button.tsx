"use client";
import type {FormEvent} from "react";
export function DeleteGalleryForm({action,id}:{action:(formData:FormData)=>void|Promise<void>;id:string}){
 function confirmRemove(event:FormEvent<HTMLFormElement>){if(!window.confirm("Remove this item from the public gallery? Its R2 object and Google Drive backup metadata will be retained."))event.preventDefault();}
 return <form action={action} onSubmit={confirmRemove} style={{marginTop:10}}><input type="hidden" name="id" value={id}/><button style={{padding:"8px 12px",borderRadius:9,border:"1px solid #e4c5c5",color:"#a12727",background:"#fff7f7"}}>Remove from public gallery</button></form>;
}
