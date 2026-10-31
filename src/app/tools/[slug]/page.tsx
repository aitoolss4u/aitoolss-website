import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool } from "@/lib/tools";
import { createToolMetadata, getToolSeoContent } from "@/lib/tool-seo.server";
import ToolPageClient from "./tool-page-client";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getToolSeoContent(slug);
  return seo ? createToolMetadata(slug, seo) : {};
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const seo = await getToolSeoContent(slug);
  if (!seo) notFound();
  return <ToolPageClient slug={slug} seo={seo} />;
}
