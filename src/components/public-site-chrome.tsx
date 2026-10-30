"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { tools } from "@/lib/tools";
import PublicSidebar from "@/components/public-sidebar";
import PublicFooter from "@/components/public-footer";

export default function PublicSiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  useEffect(() => { const update = () => setShowTop(window.scrollY > 520); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const activeCategory = tools.find((tool) => tool.slug === slug)?.category ?? "";
  return (
    <div className="public-site-layout">
      <PublicSidebar activeCategory={activeCategory} />
      <div className="public-site-main">
        {children}
        <PublicFooter />
      </div>
      {showTop && <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} aria-label="Back to top" title="Back to top">↑</button>}
    </div>
  );
}
