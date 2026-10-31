"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { categories as catalogCategories } from "@/lib/tools";
import BrandLogo from "@/components/brand-logo";

export type PublicCategory = {
  name: string;
  icon?: string;
  tint?: string;
  subtitle?: string;
  count?: number;
  imageUrl?: string | null;
  imageAlt?: string;
};

const categoryIcons: Record<string, string> = {
  Writing: "Aa",
  Images: "◈",
  Productivity: "✳",
  Coding: "{ }",
  Marketing: "↗",
  Education: "▤",
  Business: "◇",
  Career: "✦",
};

type PublicSidebarProps = {
  categories?: PublicCategory[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
};

export default function PublicSidebar({
  categories,
  activeCategory = "",
  onCategoryChange,
}: PublicSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [remoteCategories, setRemoteCategories] = useState<PublicCategory[]>(catalogCategories.map((name) => ({ name, icon: categoryIcons[name] ?? name.slice(0, 1) })));
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    const onPointerDown = (event: PointerEvent) => { if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) setMenuOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("pointerdown", onPointerDown); };
  }, [menuOpen]);
  useEffect(() => {
    if (categories) return;
    let active = true;
    fetch("/api/categories").then((response) => response.ok ? response.json() : null).then((data) => {
      if (!active || !Array.isArray(data?.items)) return;
      const rawItems: unknown[] = data.items as unknown[];
      const items = rawItems.filter((item: unknown): item is { name: string; image_url?: string | null; image_alt?: string | null } => !!item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string" && catalogCategories.includes((item as { name: string }).name));
      if (items.length) setRemoteCategories(items.map((item) => ({ name: item.name, icon: categoryIcons[item.name] ?? item.name.slice(0, 1), imageUrl: item.image_url ?? "", imageAlt: item.image_alt ?? "" })));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [categories]);
  const visibleCategories = categories ?? remoteCategories;

  const choose = (name: string) => {
    if (onCategoryChange) {
      onCategoryChange(name);
      setMenuOpen(false);
      return;
    }
    router.push("/?category=" + encodeURIComponent(name) + "#search");
    setMenuOpen(false);
  };

  return (
    <>
    <div className="mobile-site-header" ref={mobileMenuRef}>
      <BrandLogo className="mobile-site-brand" size={44} />
      <button type="button" className="mobile-menu-toggle" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-site-menu" onClick={() => setMenuOpen((open) => !open)}>
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </button>
      {menuOpen && <nav id="mobile-site-menu" className="mobile-site-menu" aria-label="Mobile navigation">
        <Link href="/" onClick={() => setMenuOpen(false)} aria-current={pathname === "/" ? "page" : undefined}>⌂ <span>Home</span></Link>
        <p>DISCOVER</p>
        {visibleCategories.map((category) => <button type="button" key={category.name} onClick={() => choose(category.name)} aria-pressed={activeCategory === category.name}>
          <span aria-hidden="true">{category.imageUrl ? <img src={category.imageUrl} alt="" className="sidebar-category-image" /> : (category.icon ?? categoryIcons[category.name] ?? category.name.slice(0, 1))}</span>{category.name}
        </button>)}
        <Link href="/admin-login" onClick={() => setMenuOpen(false)}>Admin sign in ↗</Link>
      </nav>}
    </div>
    <aside className="category-sidebar" aria-label="Main site navigation">
      <div className="sidebar-inner">
        <BrandLogo className="sidebar-brand" size={48} />
        <Link href="/" className="sidebar-home" aria-current={pathname === "/" ? "page" : undefined}>
          <span aria-hidden="true">⌂</span><span>Home</span>
        </Link>
        <p className="sidebar-heading">DISCOVER</p>
        {visibleCategories.map((category) => (
          <button
            type="button"
            key={category.name}
            className={`sidebar-item ${activeCategory === category.name ? "sidebar-item-active" : ""}`}
            onClick={() => choose(category.name)}
            aria-pressed={activeCategory === category.name}
          >
            <span aria-hidden="true">{category.imageUrl ? <img src={category.imageUrl} alt="" className="sidebar-category-image" /> : (category.icon ?? categoryIcons[category.name] ?? category.name.slice(0, 1))}</span>
            <span>{category.name}</span>
          </button>
        ))}
        <div className="sidebar-note">
          <span>✦ A little inspiration</span>
          <p>Small tools can unlock big ideas. Explore until something clicks.</p>
        </div>
        <Link className="sidebar-admin-link" href="/admin-login">Admin sign in ↗</Link>
      </div>
    </aside>
    </>
  );
}
