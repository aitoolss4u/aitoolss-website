import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export async function getCmsMetadata(slug:string, fallback:Metadata):Promise<Metadata>{
 try{
  const supabase=await createClient();
  const {data}=await supabase.from("content_pages").select("meta_title,meta_description,is_published").eq("slug",slug).maybeSingle();
  if(!data||!data.is_published)return fallback;
  return {
   ...fallback,
   title: data.meta_title?.trim() || fallback.title,
   description: data.meta_description?.trim() || fallback.description,
  };
 }catch{return fallback;}
}
export async function getSiteMetadata(fallback:Metadata):Promise<Metadata>{
 try{
  const supabase=await createClient();
  const {data}=await supabase.from("site_settings").select("value").eq("key","global").maybeSingle();
  const value=data?.value as Record<string,unknown>|undefined;
  if(!value)return fallback;
  const title=typeof value.defaultMetaTitle==="string"&&value.defaultMetaTitle.trim()?value.defaultMetaTitle:fallback.title;
  const description=typeof value.defaultMetaDescription==="string"&&value.defaultMetaDescription.trim()?value.defaultMetaDescription:fallback.description;
  return {...fallback,title,description,applicationName:typeof value.siteName==="string"?value.siteName:"AIToolss"};
 }catch{return fallback;}
}
