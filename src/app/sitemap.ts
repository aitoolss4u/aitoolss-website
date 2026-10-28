import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/privacy", "/terms", "/tools/word-counter", "/tools/text-summarizer", "/tools/image-compressor"];
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date("2026-10-28"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/tools/") ? 0.8 : 0.5,
  }));
}
