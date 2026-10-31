import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createGalleryItem, deleteGalleryItem, saveGalleryLayout, updateGalleryItem } from "./actions";
import { DeleteGalleryForm } from "./delete-button";
import GalleryMediaInput from "./media-input";
import { isR2Configured } from "@/lib/r2";

export const metadata = { title: "Gallery management | AIToolss Admin", robots: { index: false, follow: false } };

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: items, error: itemsError }, { data: settingsRow }, { data: categories }] = await Promise.all([
    supabase.from("gallery_items").select("id,media_type,media_url,thumbnail_url,title,description,creator,is_published,sort_order,created_at,storage_provider,r2_object_key,r2_original_object_key,r2_thumbnail_key,original_file_name,original_size_bytes,backup_google_drive_url,backup_status,backup_confirmed_at,backup_saved_at").order("sort_order").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("value").eq("key", "gallery_layout").maybeSingle(),
    supabase.from("categories").select("image_original_size_bytes,image_r2_key,image_original_r2_key"),
  ]);
  const settings = (settingsRow?.value ?? { columns: 4, rows: 4 }) as { columns?: number; rows?: number };
  const columns = [4,5,6].includes(Number(settings.columns)) ? Number(settings.columns) : 4;
  const rows = [3,4,5,6].includes(Number(settings.rows)) ? Number(settings.rows) : 4;
  const messages: Record<string,string> = { "invalid-layout":"Choose a supported column and row count.", "save-layout":"Could not save the gallery settings. Confirm the Phase 13 migration is applied.", "invalid-media":"The R2 object could not be verified or the HTTPS media URL is invalid. Check upload details and run the R2 metadata migration.", "backup-url":"Use a valid Google Drive sharing URL. Mark it confirmed only after opening and checking that file.", create:"Could not create the media entry.", update:"Could not update this media entry.", delete:"Could not remove this media entry from the public gallery.", "invalid-id":"The media entry ID is invalid." };
  const totalGalleryBytes = (items ?? []).reduce((sum, item) => sum + Number(item.original_size_bytes ?? 0), 0);
  const totalCategoryBytes = (categories ?? []).reduce((sum, item) => sum + Number(item.image_original_size_bytes ?? 0), 0);
  const estimatedBytes = totalGalleryBytes + totalCategoryBytes;
  const estimatedPercent = estimatedBytes / (10 * 1024 * 1024 * 1024) * 100;
  const backupCount = (status: string) => (items ?? []).filter((item) => (item.backup_status ?? "backup_pending") === status).length;
  const formatBytes = (bytes: number) => bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + " KB" : (bytes / (1024 * 1024 * 1024) >= 1 ? (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB" : (bytes / (1024 * 1024)).toFixed(1) + " MB");
  return <main style={{minHeight:"100vh",background:"#faf9ff",color:"#28233f",padding:"clamp(1rem,4vw,3rem)"}}>
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <Link href="/admin" style={{color:"#654ed0",fontWeight:700}}>← Back to Admin Studio</Link>
      <header style={{margin:"1.5rem 0 2rem"}}><p style={{fontSize:12,fontWeight:800,letterSpacing:".16em",color:"#7657ff"}}>AIToolss / CONTENT</p><h1 style={{fontSize:"clamp(2rem,5vw,3rem)",fontWeight:900,letterSpacing:"-.04em"}}>AI Creations Gallery</h1><p style={{color:"#77718e",marginTop:8}}>Manage persistent R2 uploads, publication, order, CDN media and Google Drive backup references. New file uploads go directly from the browser to R2 after admin authorization; legacy Supabase Storage and external HTTPS media remain available.</p></header>
      <section id="storage" style={{padding:20,border:"1px solid #e8e2f6",borderRadius:18,background:"#fff",marginBottom:24}}>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"start",justifyContent:"space-between",gap:12}}>
          <div><h2 style={{fontSize:20,fontWeight:850}}>Storage &amp; backup overview</h2><p style={{color:"#77718e",fontSize:13,marginTop:6}}>R2 is the intended primary store for new uploads. Existing Supabase Storage and external links are preserved.</p></div>
          <a href="/api/admin/gallery/backup-manifest" style={{display:"inline-flex",padding:"10px 14px",borderRadius:10,border:"1px solid #d9d2ee",color:"#58449e",fontWeight:800,fontSize:13}}>↓ Export backup CSV</a>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginTop:18}}>
          {[[ "Gallery items", String(items?.length ?? 0) ],[ "Backup pending", String(backupCount("backup_pending")) ],[ "Link saved", String(backupCount("backup_link_saved")) ],[ "Backup confirmed", String(backupCount("backup_confirmed")) ],[ "Backup missing", String(backupCount("backup_missing")) ]].map(([label,value])=><div key={label} style={{padding:13,border:"1px solid #ece8f4",borderRadius:12,background:"#faf9fd"}}><small style={{color:"#817b91"}}>{label}</small><strong style={{display:"block",fontSize:22,color:"#29263a",marginTop:4}}>{value}</strong></div>)}
        </div>
        <div style={{marginTop:18}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><strong style={{fontSize:13}}>Recorded original media size (application estimate)</strong><strong style={{fontSize:13}}>{formatBytes(estimatedBytes)} / 10 GB · {estimatedPercent.toFixed(2)}%</strong></div>
          <div style={{height:9,borderRadius:999,background:"#eeeaf5",overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:Math.min(100,estimatedPercent)+"%",background:estimatedPercent>=95?"#dc515a":estimatedPercent>=85?"#d98d32":estimatedPercent>=70?"#c9a23c":"#46a77d"}} /></div>
          <p style={{fontSize:12,color:"#817b91",marginTop:7}}>Warnings: 70% · 85% · 95%. This estimate sums stored original file sizes recorded in the database; it is not the Cloudflare billing meter and may not include orphaned R2 objects.</p>
        </div>
        <div style={{marginTop:12,padding:12,borderRadius:12,background:isR2Configured()?"#edf8f1":"#fff7e8",color:isR2Configured()?"#236a42":"#7b5a20",fontSize:13}}>
          {isR2Configured() ? "R2 credentials are present in this runtime. Verify the media domain and a real test upload before treating the integration as operational." : "R2 is not configured in this deployment yet. Add the server-only R2 variables and connect media.aitoolss.com in Cloudflare before uploads can work."}
        </div>
      </section>
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
        <h2 style={{fontSize:20,fontWeight:850,marginBottom:16}}>Add media</h2><p style={{color:"#77718e",fontSize:13,lineHeight:1.7,marginBottom:14}}>Upload supported files directly to the configured Cloudflare R2 bucket using a short-lived admin-authorized URL. You may also retain a public HTTPS media URL for external or legacy media. Google Drive links belong only in the backup field, never as the public delivery URL. R2 requires the Supabase metadata migration, Cloudflare bucket/domain, and Vercel environment variables.</p>
        <form action={createGalleryItem} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Media type<select name="media_type" required style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}}><option value="image">Image</option><option value="video">Video</option></select></label>
          <label style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>Media URL (HTTPS, optional if uploading)<input name="media_url" type="url" placeholder="https://…" style={{padding:10,border:"1px solid #ddd5f0",borderRadius:10}} /></label>
          <GalleryMediaInput label="Upload image or video (optional if using a URL)" />
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
          <div style={{marginBottom:12}}>{item.media_type === "image" ? <img src={item.thumbnail_url || item.media_url} alt={item.title || "Gallery media"} style={{maxWidth:260,maxHeight:160,objectFit:"contain",borderRadius:10}} /> : <video src={item.media_url} controls playsInline preload="none" poster={item.thumbnail_url ?? undefined} style={{maxWidth:320,maxHeight:180,borderRadius:10}} />}</div>
          <form action={updateGalleryItem} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            <input type="hidden" name="id" value={item.id} />
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Type<select name="media_type" defaultValue={item.media_type} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}}><option value="image">Image</option><option value="video">Video</option></select></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Media URL<input name="media_url" type="url" defaultValue={item.media_url} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <GalleryMediaInput label="Replace media with direct R2 upload (optional)" current={{ mediaUrl: item.storage_provider === "r2" ? item.media_url : "", objectKey: item.r2_object_key ?? "", originalObjectKey: item.r2_original_object_key ?? "", thumbnailUrl: item.storage_provider === "r2" ? item.thumbnail_url ?? "" : "", thumbnailKey: item.r2_thumbnail_key ?? "", fileName: item.original_file_name ?? "", fileSize: item.original_size_bytes ?? 0, storageProvider: item.storage_provider === "r2" ? "r2" : "external" }} />
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Thumbnail URL<input name="thumbnail_url" type="url" defaultValue={item.thumbnail_url ?? ""} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Title<input name="title" maxLength={160} defaultValue={item.title} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Creator<input name="creator" maxLength={100} defaultValue={item.creator} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Description<input name="description" maxLength={500} defaultValue={item.description} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Google Drive backup URL<input name="backup_google_drive_url" type="url" defaultValue={item.backup_google_drive_url ?? ""} placeholder="https://drive.google.com/file/d/…" style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Backup status<select name="backup_status" defaultValue={item.backup_status ?? "backup_pending"} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}}><option value="backup_pending">Backup Pending</option><option value="backup_link_saved">Backup Link Saved</option><option value="backup_confirmed">Backup Confirmed</option><option value="backup_missing">Backup Missing</option></select></label>
            <label style={{display:"flex",gap:8,alignItems:"center",fontSize:12,fontWeight:700}}><input type="checkbox" name="backup_confirmed_now" /> I opened and checked this Drive file now</label>
            <small style={{color:"#817891"}}>Saving a URL alone never confirms a backup. Confirm only after checking the file itself. Current status: {item.backup_status ?? "backup_pending"}{item.backup_saved_at ? " · Saved " + new Date(item.backup_saved_at).toLocaleString() : ""}{item.backup_confirmed_at ? " · Confirmed " + new Date(item.backup_confirmed_at).toLocaleString() : ""}.</small>
            <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Sort order<input name="sort_order" type="number" min="0" max="100000" defaultValue={item.sort_order} style={{padding:9,border:"1px solid #ddd5f0",borderRadius:9}} /></label>
            <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" name="is_published" defaultChecked={item.is_published} /> Published</label>
            <div style={{display:"flex",gap:8,alignItems:"center"}}><button style={{padding:"10px 14px",borderRadius:9,background:"#6d53d7",color:"#fff",fontWeight:800}}>Save item</button></div>
          </form>
          <DeleteGalleryForm action={deleteGalleryItem} id={item.id} />
        </article>)}</div>}
      </section>
    </div>
  </main>;
}
