import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createR2UploadUrl,isR2Configured} from "@/lib/r2";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const imageTypes:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"};
const categoryTypes:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
const videoTypes:Record<string,string>={"video/mp4":"mp4","video/webm":"webm"};
export async function POST(request:Request){
 try{
  const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user||user.app_metadata?.role!=="admin")return NextResponse.json({error:"Administrator access is required."},{status:403});
  if(!isR2Configured())return NextResponse.json({error:"Cloudflare R2 is not configured. Add the server-only R2 variables in Vercel and redeploy."},{status:503});
  const body=await request.json() as Record<string,unknown>;const purpose=body.purpose==="category"?"category":body.purpose==="gallery"?"gallery":null;
  const mediaType=body.mediaType==="video"?"video":body.mediaType==="image"?"image":null;const variant=typeof body.variant==="string"?body.variant:"";
  const mime=typeof body.contentType==="string"?body.contentType.toLowerCase():"";const size=Number(body.sizeBytes);
  if(!purpose||!mediaType||!Number.isSafeInteger(size)||size<=0)return NextResponse.json({error:"Invalid upload details."},{status:400});
  const limit=mediaType==="video"?500*1024*1024:50*1024*1024;if(size>limit)return NextResponse.json({error:"File exceeds the "+(limit/1024/1024)+" MB limit."},{status:413});
  if(purpose==="category"&&(mediaType!=="image"||!["original","optimized"].includes(variant)))return NextResponse.json({error:"Category uploads support original and optimized images only."},{status:400});
  let ext="",prefix="";
  if(purpose==="category"){const id=typeof body.categoryId==="string"?body.categoryId:"";if(!/^[0-9a-f-]{36}$/iu.test(id))return NextResponse.json({error:"A valid category ID is required."},{status:400});ext=variant==="optimized"?(mime==="image/webp"?"webp":""):(categoryTypes[mime]??"");prefix="categories/"+id+"/"+variant+"/";}
  else if(mediaType==="image"){if(!["original","optimized","thumbnail"].includes(variant))return NextResponse.json({error:"Invalid image variant."},{status:400});ext=variant==="original"?(imageTypes[mime]??""):(mime==="image/webp"?"webp":"");prefix="gallery/images/"+(variant==="thumbnail"?"thumbnails":variant)+"/";}
  else{if(!["original","poster"].includes(variant))return NextResponse.json({error:"Invalid video variant."},{status:400});ext=variant==="original"?(videoTypes[mime]??""):(mime==="image/webp"?"webp":"");prefix=variant==="poster"?"gallery/videos/posters/":"gallery/videos/original/";}
  if(!ext)return NextResponse.json({error:"Unsupported MIME type for this upload variant."},{status:415});
  const key=prefix+crypto.randomUUID()+"."+ext;
  return NextResponse.json({...await createR2UploadUrl(key,mime,size),key,contentType:mime,maxBytes:limit});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not prepare the R2 upload."},{status:500});}
}