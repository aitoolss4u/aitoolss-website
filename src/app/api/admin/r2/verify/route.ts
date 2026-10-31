import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {headR2Object,isAllowedR2Key,type R2ObjectInfo} from "@/lib/r2";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user||user.app_metadata?.role!=="admin")return NextResponse.json({error:"Administrator access is required."},{status:403});
  const body=await request.json() as {purpose?:unknown;keys?:unknown};const purpose=body.purpose==="category"?"category":body.purpose==="gallery"?"gallery":null;
  if(!purpose||!Array.isArray(body.keys)||body.keys.length<1||body.keys.length>4)return NextResponse.json({error:"Invalid object verification request."},{status:400});
  const keys=body.keys.filter((key):key is string=>typeof key==="string");
  if(keys.length!==body.keys.length||keys.some(key=>!isAllowedR2Key(key,purpose)))return NextResponse.json({error:"One or more keys are outside the permitted media folders."},{status:400});
  const objects:R2ObjectInfo[]=await Promise.all(keys.map(key=>headR2Object(key)));
  return NextResponse.json({verified:true,objects});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"R2 object verification failed."},{status:400});}
}