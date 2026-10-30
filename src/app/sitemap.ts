import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "/about", "/contact-us", "/privacy", "/terms", "/disclaimer",
    "/cookie-consent", "/categories", "/types-of-tools", "/popular-tools",
    "/new-trending-tools",
    ...tools.map((tool) => `/tools/${tool.slug}`),
  ];
  return routes.map((route) => ({
    url: route.startsWith("http") ? route : `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : route.startsWith("/tools/") ? "monthly" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/tools/") ? 0.8 : 0.6,
  }));
}
