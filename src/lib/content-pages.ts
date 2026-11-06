import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { createClient as createPublicClient } from "@supabase/supabase-js";

const getCachedCmsMetadata = unstable_cache(async (slug: string) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createPublicClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await supabase.from("content_pages").select("meta_title,meta_description,is_published").eq("slug", slug).maybeSingle();
  return error || !data?.is_published ? null : data;
}, ["public-cms-metadata"], { revalidate: 300 });

export async function getCmsMetadata(slug:string, fallback:Metadata):Promise<Metadata>{
 try{
  const data = await getCachedCmsMetadata(slug);
  if(!data)return fallback;
  return {
   ...fallback,
   title: data.meta_title?.trim().replace(/(?:\s*\|\s*AIToolss|\s+AIToolss)+$/i, "") || fallback.title,
   description: data.meta_description?.trim() || fallback.description,
  };
 }catch{return fallback;}
}
export async function getSiteMetadata(fallback:Metadata):Promise<Metadata>{
 try{
  const supabase=await createClient();
  const {data}=await supabase.rpc("get_public_site_metadata");
  const value=data as Record<string,unknown>|undefined;
  if(!value)return fallback;
  const title=typeof value.defaultMetaTitle==="string"&&value.defaultMetaTitle.trim()?value.defaultMetaTitle:fallback.title;
  const description=typeof value.defaultMetaDescription==="string"&&value.defaultMetaDescription.trim()?value.defaultMetaDescription:fallback.description;
  return {...fallback,title,description,applicationName:typeof value.siteName==="string"?value.siteName:"AIToolss"};
 }catch{return fallback;}
}
