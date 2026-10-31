import type {Metadata} from "next";
import {siteConfig} from "@/lib/site";
import {getTool} from "@/lib/tools";
import {buildToolSeoContent,type ToolSeoContent} from "@/lib/tool-seo";
import {createClient} from "@/lib/supabase/server";
function normalize(slug:string,data:Record<string,unknown>,fallback:ToolSeoContent):ToolSeoContent{
 const steps=Array.isArray(data.seo_how_to)?data.seo_how_to.filter((v):v is string=>typeof v==="string"):fallback.howToUse;
 const faqs=Array.isArray(data.seo_faqs)?data.seo_faqs.filter((v):v is {question:string;answer:string}=>!!v&&typeof v==="object"&&typeof (v as {question?:unknown}).question==="string"&&typeof (v as {answer?:unknown}).answer==="string"):fallback.faqs;
 return {slug,introduction:typeof data.seo_introduction==="string"&&data.seo_introduction?data.seo_introduction:fallback.introduction,whatIs:typeof data.seo_what_is==="string"&&data.seo_what_is?data.seo_what_is:fallback.whatIs,howToUse:steps.length>=3?steps:fallback.howToUse,faqs:faqs.length===6?faqs:fallback.faqs,metaTitle:typeof data.meta_title==="string"&&data.meta_title?data.meta_title:fallback.metaTitle,metaDescription:typeof data.meta_description==="string"&&data.meta_description?data.meta_description:fallback.metaDescription,ogTitle:typeof data.og_title==="string"&&data.og_title?data.og_title:fallback.ogTitle,ogDescription:typeof data.og_description==="string"&&data.og_description?data.og_description:fallback.ogDescription};
}
export async function getToolSeoContent(slug:string):Promise<ToolSeoContent|null>{
 const tool=getTool(slug);if(!tool)return null;const fallback=buildToolSeoContent(tool);
 try{const supabase=await createClient();const {data,error}=await supabase.from("tools").select("seo_introduction,seo_what_is,seo_how_to,seo_faqs,meta_title,meta_description,og_title,og_description").eq("slug",slug).eq("is_active",true).maybeSingle();if(!error&&data)return normalize(slug,data as Record<string,unknown>,fallback);}catch{/* Unique fallback keeps tool routes available before the SEO migration is applied. */}
 return fallback;
}
export function createToolMetadata(slug:string,seo:ToolSeoContent):Metadata{
 const url=new URL("/tools/"+slug,siteConfig.url).toString();
 return {title:seo.metaTitle,description:seo.metaDescription,alternates:{canonical:url},openGraph:{type:"website",siteName:siteConfig.name,title:seo.ogTitle,description:seo.ogDescription,url},twitter:{card:"summary",title:seo.ogTitle,description:seo.ogDescription}};
}