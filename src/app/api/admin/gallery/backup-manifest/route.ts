import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
function cell(value:unknown){const text=String(value??"");return '"'+text.replace(/"/g,'""')+'"';}
export async function GET(){
 const supabase=await createClient();const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user||user.app_metadata?.role!=="admin")return NextResponse.json({error:"Administrator access is required."},{status:403});
 const {data,error}=await supabase.from("gallery_items").select("title,media_type,original_file_name,original_size_bytes,r2_object_key,r2_original_object_key,r2_thumbnail_key,media_url,backup_google_drive_url,backup_status,created_at").order("created_at",{ascending:false});
 if(error)return NextResponse.json({error:"Could not load the backup manifest. Apply the R2/Drive metadata migration first."},{status:503});
 const headers=["Media title","Media type","Original filename","File size bytes","R2 object key","R2 original object key","R2 thumbnail key","CDN / media URL","Google Drive backup URL","Backup status","Created date"];
 const rows=(data??[]).map(item=>[item.title,item.media_type,item.original_file_name,item.original_size_bytes,item.r2_object_key,item.r2_original_object_key,item.r2_thumbnail_key,item.media_url,item.backup_google_drive_url,item.backup_status,item.created_at]);
 const csvText=[headers,...rows].map(row=>row.map(cell).join(",")).join("\r\n");
 return new NextResponse("\uFEFF"+csvText,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="aitoolss-gallery-backup-manifest.csv"',"Cache-Control":"no-store"}});
}
