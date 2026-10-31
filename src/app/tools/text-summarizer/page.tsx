import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetailSections from "@/components/tool-detail-sections";
import { getTool } from "@/lib/tools";
import { createToolMetadata, getToolSeoContent } from "@/lib/tool-seo.server";
import TextSummarizerInterface from "./textsummarizerinterface";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getToolSeoContent("text-summarizer");
  return seo ? createToolMetadata("text-summarizer", seo) : {};
}

export default async function TextSummarizerPage() {
  const tool = getTool("text-summarizer");
  const seo = await getToolSeoContent("text-summarizer");
  if (!tool || !seo) notFound();
  return <ToolDetailSections tool={tool} seo={seo}><TextSummarizerInterface /></ToolDetailSections>;
}
