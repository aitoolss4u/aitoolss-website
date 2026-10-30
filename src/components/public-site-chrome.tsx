"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { tools } from "@/lib/tools";
import PublicSidebar from "@/components/public-sidebar";
import PublicFooter from "@/components/public-footer";

export default function PublicSiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const activeCategory = tools.find((tool) => tool.slug === slug)?.category ?? "";
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
