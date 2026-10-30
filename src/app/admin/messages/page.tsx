import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const metadata={title:"Contact inbox | AIToolss Admin",robots:{index:false,follow:false}};
async function updateStatus(formData:FormData){
 "use server";
 const id=String(formData.get("id")??""); const status=String(formData.get("status")??"");
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["read","archived"].includes(status)) redirect("/admin/messages?error=invalid");
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user||user.app_metadata?.role!=="admin") redirect("/admin-login?error=not-authorized");
 const {error}=await supabase.from("contact_messages").update({status}).eq("id",id);
 if(error) redirect("/admin/messages?error=save");
 revalidatePath("/admin/messages"); redirect("/admin/messages?saved=1");
}
export default async function AdminMessages({searchParams}:{searchParams:Promise<{error?:string;saved?:string}>}){
 const params=await searchParams; const supabase=await createClient(); const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user||user.app_metadata?.role!=="admin") redirect("/admin-login");
 const {data,error}=await supabase.from("contact_messages").select("id,name,email,subject,message,status,created_at").order("created_at",{ascending:false}).limit(100);
 return <main style={{minHeight:"100vh",background:"#faf9ff",color:"#28233f",padding:"clamp(1rem,4vw,3rem)"}}><div style={{maxWidth:1100,margin:"0 auto"}}>
 <Link href="/admin" style={{color:"#654ed0",fontWeight:700}}>← Back to Admin Studio</Link><header style={{margin:"1.5rem 0 2rem"}}><p style={{fontSize:12,fontWeight:800,letterSpacing:".16em",color:"#7657ff"}}>AIToolss / INBOX</p><h1 style={{fontSize:"clamp(2rem,5vw,3rem)",fontWeight:900}}>Contact messages</h1><p style={{color:"#77718e",marginTop:8}}>Private admin-only inbox for website contact form submissions. Up to 100 most recent messages are shown.</p></header>
 {params.saved&&<p role="status" style={{padding:12,background:"#e6faef",borderRadius:10,marginBottom:14}}>Message status updated.</p>}
 {params.error&&<p role="alert" style={{padding:12,background:"#fff0f0",borderRadius:10,marginBottom:14}}>Could not update the message. Please try again.</p>}
 {error?<p style={{padding:18,background:"#fff0f0",borderRadius:12}}>The contact inbox table is not available. Apply the Phase 14 Supabase migration first.</p>:!data?.length?<p style={{padding:18,background:"#fff",borderRadius:12}}>No contact messages yet.</p>:<div style={{display:"grid",gap:14}}>{data.map(message=><article key={message.id} style={{padding:18,border:"1px solid #e8e2f6",borderRadius:14,background:"#fff",display:"grid",gap:8}}>
 <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between",gap:8}}><h2 style={{fontWeight:850,fontSize:18}}>{message.subject}</h2><span style={{fontSize:12,color:"#77718e"}}>{message.status} · {new Date(message.created_at).toLocaleString()}</span></div>
 <p style={{fontSize:13,color:"#655d77"}}>{message.name} · <a href={"mailto:"+message.email} style={{color:"#654ed0",textDecoration:"underline"}}>{message.email}</a></p>
 <p style={{whiteSpace:"pre-wrap",lineHeight:1.7,fontSize:14}}>{message.message}</p>
 {message.status==="new"&&<form action={updateStatus}><input type="hidden" name="id" value={message.id}/><input type="hidden" name="status" value="read"/><button style={{padding:"8px 12px",background:"#6d53d7",color:"#fff",borderRadius:8,fontWeight:700}}>Mark as read</button></form>}
 {message.status!=="archived"&&<form action={updateStatus}><input type="hidden" name="id" value={message.id}/><input type="hidden" name="status" value="archived"/><button style={{padding:"8px 12px",border:"1px solid #ddd5f0",borderRadius:8,fontWeight:700}}>Archive</button></form>}
 </article>)}</div>}
 </div></main>;
}
