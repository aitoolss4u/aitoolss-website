import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { saveContentPage } from "./actions";
export const metadata={title:"Company & Legal content | AIToolss Admin",robots:{index:false,follow:false}};
const pages=[["about","About"],["privacy","Privacy Policy"],["terms","Terms & Conditions"],["disclaimer","Disclaimer"],["cookie-consent","Cookie Policy & Consent"],["contact-us","Contact Us"]] as const;
export default async function AdminPages({searchParams}:{searchParams:Promise<{saved?:string;error?:string}>}) {
 const params=await searchParams; const supabase=await createClient();
 const {data,error}=await supabase.from("content_pages").select("slug,title,intro,body_markdown,meta_title,meta_description,is_published").order("slug");
 const rows=new Map((data??[]).map(row=>[row.slug,row]));
 return <main style={{minHeight:"100vh",background:"#faf9ff",color:"#28233f",padding:"clamp(1rem,4vw,3rem)"}}>
  <div style={{maxWidth:1100,margin:"0 auto"}}><Link href="/admin" style={{color:"#654ed0",fontWeight:700}}>← Back to Admin Studio</Link>
  <header style={{margin:"1.5rem 0 2rem"}}><p style={{fontSize:12,fontWeight:800,letterSpacing:".16em",color:"#7657ff"}}>AIToolss / CONTENT MANAGEMENT</p><h1 style={{fontSize:"clamp(2rem,5vw,3rem)",fontWeight:900}}>Company &amp; Legal pages</h1><p style={{color:"#77718e",marginTop:8}}>Edit the published copy and SEO metadata for all six public pages. Changes are saved in Supabase and appear on the public pages after refresh.</p></header>
  {params.saved&&<p role="status" style={{padding:12,background:"#e6faef",borderRadius:10,marginBottom:14}}>Saved {params.saved}.</p>}
  {params.error&&<p role="alert" style={{padding:12,background:"#fff0f0",borderRadius:10,marginBottom:14}}>{params.error==="migration"?"Apply migration 202610300001_phase14_public_customization.sql in Supabase first.":"Could not save the page. Check the field limits and Supabase migration."}</p>}
  {error?<p role="alert" style={{padding:16,background:"#fff0f0",borderRadius:12}}>The content_pages table is unavailable. Apply <code>supabase/migrations/202610300001_phase14_public_customization.sql</code> in the Supabase SQL Editor, then reload.</p>:<div style={{display:"grid",gap:18}}>{pages.map(([slug,label])=>{const row=rows.get(slug);return <form key={slug} action={saveContentPage} style={{display:"grid",gap:12,padding:20,border:"1px solid #e8e2f6",borderRadius:16,background:"#fff"}}>
   <input type="hidden" name="slug" value={slug}/><div><h2 style={{fontSize:20,fontWeight:850}}>{label}</h2><p style={{fontSize:12,color:"#817891"}}>/{slug}</p></div>
   <label style={{display:"grid",gap:5,fontSize:13,fontWeight:700}}>Page title<input name="title" required maxLength={160} defaultValue={row?.title??label} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:9}}/></label>
   <label style={{display:"grid",gap:5,fontSize:13,fontWeight:700}}>Introduction<textarea name="intro" maxLength={1000} rows={2} defaultValue={row?.intro??""} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:9}}/></label>
   <label style={{display:"grid",gap:5,fontSize:13,fontWeight:700}}>Page content (simple Markdown)<textarea name="body_markdown" maxLength={30000} rows={10} defaultValue={row?.body_markdown??""} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:9,fontFamily:"monospace"}} placeholder={"## Section heading\nParagraph text\n- List item"}/></label>
   <label style={{display:"grid",gap:5,fontSize:13,fontWeight:700}}>Meta title<input name="meta_title" maxLength={120} defaultValue={row?.meta_title??""} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:9}}/></label>
   <label style={{display:"grid",gap:5,fontSize:13,fontWeight:700}}>Meta description<textarea name="meta_description" maxLength={320} rows={2} defaultValue={row?.meta_description??""} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:9}}/></label>
   <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,fontWeight:700}}><input type="checkbox" name="is_published" defaultChecked={row?.is_published??true}/> Published on public website</label>
   <button style={{justifySelf:"start",padding:"10px 16px",borderRadius:10,background:"#6d53d7",color:"#fff",fontWeight:800}}>Save {label}</button>
  </form>})}</div>}
 </div></main>;
}
