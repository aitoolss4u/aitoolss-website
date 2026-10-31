import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetailSections from "@/components/tool-detail-sections";
import { getTool } from "@/lib/tools";
import { createToolMetadata, getToolSeoContent } from "@/lib/tool-seo.server";
import WordCounterInterface from "./wordcounterinterface";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getToolSeoContent("word-counter");
  return seo ? createToolMetadata("word-counter", seo) : {};
}

export default async function WordCounterPage() {
  const tool = getTool("word-counter");
  const seo = await getToolSeoContent("word-counter");
  if (!tool || !seo) notFound();
  return <ToolDetailSections tool={tool} seo={seo}><WordCounterInterface /></ToolDetailSections>;
}
