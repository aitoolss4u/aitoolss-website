"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { tools } from "@/lib/tools";
import PublicSidebar from "@/components/public-sidebar";
import PublicFooter from "@/components/public-footer";
import { useEffect } from "react";

export default function PublicSiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const activeCategory = tools.find((tool) => tool.slug === slug)?.category ?? "";
  useEffect(() => {
    let active = true;
    fetch("/api/site-theme").then((response) => response.ok ? response.json() : { theme: null }).then(({ theme }) => {
      if (!active || !theme) return;
      const root = document.documentElement;
      root.style.setProperty("--color-violet", theme.primaryColor);
      root.style.setProperty("--color-cyan", theme.accentColor);
      root.style.setProperty("--color-midnight", theme.backgroundColor);
      root.style.setProperty("--background", theme.backgroundColor);
      root.style.setProperty("--site-font", theme.font);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <div className="public-site-layout">
      <PublicSidebar activeCategory={activeCategory} />
      <div className="public-site-main">
        {children}
        <PublicFooter />
      </div>
    </div>
  );
}
