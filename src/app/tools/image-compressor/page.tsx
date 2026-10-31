import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetailSections from "@/components/tool-detail-sections";
import { getTool } from "@/lib/tools";
import { createToolMetadata, getToolSeoContent } from "@/lib/tool-seo.server";
import ImageCompressorInterface from "./imagecompressorinterface";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getToolSeoContent("image-compressor");
  return seo ? createToolMetadata("image-compressor", seo) : {};
}

export default async function ImageCompressorPage() {
  const tool = getTool("image-compressor");
  const seo = await getToolSeoContent("image-compressor");
  if (!tool || !seo) notFound();
  return <ToolDetailSections tool={tool} seo={seo}><ImageCompressorInterface /></ToolDetailSections>;
}
