"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { categories as catalogCategories, tools as catalogTools } from "@/lib/tools";

export type PublicCategory = {
  name: string;
  icon?: string;
  tint?: string;
  subtitle?: string;
  count?: number;
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
  const visibleCategories = categories ?? catalogCategories.map((name) => ({
    name,
    icon: categoryIcons[name] ?? name.slice(0, 1),
    count: catalogTools.filter((tool) => tool.category === name).length,
  }));

  const choose = (name: string) => {
    if (onCategoryChange) {
      onCategoryChange(name);
      return;
    }
    router.push("/?category=" + encodeURIComponent(name) + "#search");
  };

  return (
    <aside className="category-sidebar" aria-label="Main site navigation">
      <div className="sidebar-inner">
        <Link href="/" className="sidebar-brand" aria-label="AIToolss home">
          <span className="light-brand-mark" aria-hidden="true">A</span>
          <span>AIToolss<span className="sidebar-brand-dot">.</span></span>
        </Link>
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
            <span aria-hidden="true">{category.icon ?? categoryIcons[category.name] ?? category.name.slice(0, 1)}</span>
            <span>{category.name}</span>
            {typeof category.count === "number" && <small>{category.count}</small>}
          </button>
        ))}
        <div className="sidebar-note">
          <span>✦ A little inspiration</span>
          <p>Small tools can unlock big ideas. Explore until something clicks.</p>
        </div>
        <Link className="sidebar-admin-link" href="/admin-login">Admin sign in ↗</Link>
      </div>
    </aside>
  );
}
