import { NextResponse } from "next/server";
import { getTool } from "@/lib/tools";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const aiSlugs = new Set([
 "text-summarizer","paragraph-rewriter","headline-generator","blog-outline-builder","email-draft-helper","tone-changer",
 "image-alt-text-helper","prompt-generator","code-explainer","social-caption-writer","hashtag-ideas","meta-description-writer",
 "youtube-description-builder","video-script-outline","product-description-writer","quiz-question-builder","essay-outline-builder",
 "business-name-ideas","interview-practice-questions","achievement-bullet-rewriter","cover-letter-builder","study-notes-organizer",
 "flashcard-maker","meeting-agenda-maker","meeting-notes-formatter"
]);
const requests = new Map<string,number[]>();
export async function POST(request:Request) {
 try {
  const body=await request.json();
  const slug=typeof body?.slug==="string"?body.slug:"";
  const input=typeof body?.input==="string"?body.input.trim():"";
  const option=typeof body?.option==="string"?body.option.slice(0,80):"";
  const tool=getTool(slug);
  if(!tool||!aiSlugs.has(slug)) return NextResponse.json({error:"This tool does not use AI generation."},{status:400});
  if(!input||input.length>12000) return NextResponse.json({error:"Please provide input between 1 and 12,000 characters."},{status:400});
  const ip=(request.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
  const now=Date.now(); const recent=(requests.get(ip)||[]).filter(t=>now-t<60_000);
  if(recent.length>=8) return NextResponse.json({error:"Please wait a minute before requesting another AI response."},{status:429});
  recent.push(now); requests.set(ip,recent);
  const credential=process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  const model=process.env.AI_MODEL;
  if(!credential||!model) return NextResponse.json({error:"AI generation is not configured yet. Link Vercel OIDC or configure AI_GATEWAY_API_KEY and AI_MODEL in the Vercel project environment variables."},{status:503});
  const system=[
   "You are the generation engine for AIToolss, a practical collection of digital tools.",
   "Complete the requested task using the supplied input and tool description.",
   "Return only the finished result. Do not echo the prompt, repeat the input, add generic filler, or append unrelated offers.",
   "Do not invent facts, citations, credentials, metrics or user details. Clearly label assumptions when needed.",
   "Use clean formatting and concise, directly usable output. Do not wrap the answer in code fences unless the task specifically requests code.",
   "If the input is ambiguous, make the smallest reasonable assumption and state it briefly."
  ].join(" ");
  const prompt=`Tool: ${tool.name}\nTool purpose: ${tool.description}\nRequested option: ${option||"Default"}\n\nUser input:\n${input}`;
  const response=await fetch("https://ai-gateway.vercel.sh/v1/chat/completions",{
   method:"POST",
   headers:{Authorization:`Bearer ${credential}`,"Content-Type":"application/json"},
   body:JSON.stringify({model,messages:[{role:"system",content:system},{role:"user",content:prompt}],temperature:0.45,max_tokens:1400}),
   signal:AbortSignal.timeout(45_000)
  });
  if(!response.ok) {
   const detail=await response.text().catch(()=>"");
   console.error("AI Gateway request failed",response.status,detail.slice(0,1000));
   return NextResponse.json({error:response.status===429?"The AI provider is busy or its usage limit was reached. Please try again shortly.":"The AI provider could not complete this request. Check the configured model and Gateway account."},{status:502});
  }
  const data=await response.json();
  const output=data?.choices?.[0]?.message?.content;
  if(typeof output!=="string"||!output.trim()) return NextResponse.json({error:"The AI provider returned an empty response. Please try again."},{status:502});
  return NextResponse.json({output:output.trim(),model},{headers:{"Cache-Control":"no-store"}});
 } catch(error) {
  console.error("AI tool execution error",error);
  return NextResponse.json({error:"The AI request could not be completed. Please try again."},{status:500});
 }
}
