import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createGalleryItem, deleteGalleryItem, saveGalleryLayout, updateGalleryItem } from "./actions";

export const metadata = { title: "Gallery management | AIToolss Admin", robots: { index: false, follow: false } };

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: items, error: itemsError }, { data: settingsRow }] = await Promise.all([
    supabase.from("gallery_items").select("id,media_type,media_url,thumbnail_url,title,description,creator,is_published,sort_order,created_at").order("sort_order").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("value").eq("key", "gallery_layout").maybeSingle(),
  ]);
  const settings = (settingsRow?.value ?? { columns: 4, rows: 4 }) as { columns?: number; rows?: number };
  const columns = [4,5,6].includes(Number(settings.columns)) ? Number(settings.columns) : 4;
  const rows = [3,4,5,6].includes(Number(settings.rows)) ? Number(settings.rows) : 4;
  const messages: Record<string,string> = { "invalid-layout":"Choose a supported column and row count.", "save-layout":"Could not save the gallery settings. Confirm the Phase 13 migration is applied.", "invalid-media":"Media and thumbnail URLs must be valid HTTPS URLs; check required fields.", create:"Could not create the media entry.", update:"Could not update this media entry.", delete:"Could not delete this media entry.", "invalid-id":"The media entry ID is invalid." };
  return <main style={{minHeight:"100vh",background:"#faf9ff",color:"#28233f",padding:"clamp(1rem,4vw,3rem)"}}>
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <Link href="/admin" style={{color:"#654ed0",fontWeight:700}}>← Back to Admin Studio</Link>
      <header style={{margin:"1.5rem 0 2rem"}}><p style={{fontSize:12,fontWeight:800,letterSpacing:".16em",color:"#7657ff"}}>AIToolss / CONTENT</p><h1 style={{fontSize:"clamp(2rem,5vw,3rem)",fontWeight:900,letterSpacing:"-.04em"}}>AI Creations Gallery</h1><p style={{color:"#77718e",marginTop:8}}>Manage HTTPS media URLs, publication, order and shared gallery layout. Direct file uploads are not configured in this project.</p></header>
      {params.saved && <p role="status" style={{padding:12,borderRadius:12,background:"#e6faef",color:"#17683b",marginBottom:16}}>Saved successfully: {params.saved.replaceAll("-"," ")}.</p>}
      {params.error && <p role="alert" style={{padding:12,borderRadius:12,background:"#fff0f0",color:"#9c2828",marginBottom:16}}>{messages[params.error] ?? "The request could not be completed."}</p>}
      <section style={{padding:20,border:"1px solid #e8e2f6",borderRadius:18,background:"#fff",marginBottom:24}}>
        <h2 style={{fontSize:20,fontWeight:850}}>Public grid settings</h2><p style={{color:"#77718e",fontSize:14,margin:"6px 0 16px"}}>Default is 4 columns × 4 rows. The public grid adapts to smaller screens.</p>
        <form action={saveGalleryLayout} style={{display:"flex",flexWrap:"wrap",alignItems:"end",gap:16}}>
          <label style={{display:"grid",gap:6,fontWeight:700}}>Columns<select name="columns" defaultValue={String(columns)} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}}><option value="4">4 columns</option><option value="5">5 columns</option><option value="6">6 columns</option></select></label>
          <label style={{display:"grid",gap:6,fontWeight:700}}>Rows<select name="rows" defaultValue={String(rows)} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}}><option value="3">3 rows</option><option value="4">4 rows</option><option value="5">5 rows</option><option value="6">6 rows</option></select></label>
          <button style={{padding:"11px 18px",borderRadius:10,background:"#6d53d7",color:"#fff",fontWeight:800}}>Save grid layout</button><span style={{color:"#77718e",fontSize:13}}>Current limit: {columns*rows} published items</span>
        </form>
      </section>
      <section style={{padding:20,border:"1px solid #e8e2f6",borderRadius:18,background:"#fff",marginBottom:24}}>
        <h2 style={{fontSize:20,fontWeight:850,marginBottom:16}}>Add media</h2>
        <form action={createGalleryItem} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Media type<select name="media_type" required style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}}><option value="image">Image</option><option value="video">Video</option></select></label>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Media URL (HTTPS)<input name="media_url" type="url" required placeholder="https://…" style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}} /></label>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Thumbnail / poster URL<input name="thumbnail_url" type="url" placeholder="https://…" style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}} /></label>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Title<input name="title" maxLength={160} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}} /></label>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Creator / attribution<input name="creator" maxLength={100} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}} /></label>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Description<input name="description" maxLength={500} style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}} /></label>
          <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" name="is_published" /> Publish on homepage</label>
          <div><button style={{padding:"11px 18px",borderRadius:10,background:"#6d53d7",color:"#fff",fontWeight:800}}>Add gallery item</button></div>
        </form>
      </section>
      <section><h2 style={{fontSize:20,fontWeight:850,marginBottom:12}}>Existing media ({items?.length ?? 0})</h2>
        {itemsError ? <p role="alert">Could not load gallery items. Confirm the Phase 13 migration and admin permissions.</p> : !items?.length ? <div style={{padding:24,border:"1px dashed #cfc5f5",borderRadius:16,color:"#77718e"}}>No media entries yet. Add a relevant AI-generated image or video URL above. Nothing is published until you choose Publish.</div> :
        <div style={{display:"grid",gap:14}}>{items.map((item) => <article key={item.id} style={{padding:16,border:"1px solid #e8e2f6",borderRadius:16,background:"#fff"}}>
          <form action={updateGalleryItem} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            <input type="hidden" name="id" value={item.id} />
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Type<select name="media_type" defaultValue={item.media_type} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}}><option value="image">Image</option><option value="video">Video</option></select></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Media URL<input name="media_url" type="url" required defaultValue={item.media_url} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Thumbnail URL<input name="thumbnail_url" type="url" defaultValue={item.thumbnail_url ?? ""} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Title<input name="title" maxLength={160} defaultValue={item.title} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Creator<input name="creator" maxLength={100} defaultValue={item.creator} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Description<input name="description" maxLength={500} defaultValue={item.description} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Sort order<input name="sort_order" type="number" min="0" max="100000" defaultValue={item.sort_order} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" name="is_published" defaultChecked={item.is_published} /> Published</label>
            <div style={{display:"flex",gap:8,alignItems:"center"}}><button style={{padding:"10px 14px",borderRadius:9,background:"#6d53d7",color:"#fff",fontWeight:800}}>Save item</button></div>
          </form>
          <form action={deleteGalleryItem} style={{marginTop:10}}><input type="hidden" name="id" value={item.id} /><button style={{padding:"8px 12px",borderRadius:9,border:"1px solid #f1bcbc",color:"#a12727"}}>Delete item</button></form>
        </article>)}</div>}
      </section>
    </div>
  </main>;
}
