"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories as catalogCategories, tools as catalogTools } from "@/lib/tools";
import type { PublicCategory } from "./public-sidebar";

type SocialLinks = Record<string, string>;
type PublicFooterProps = {
  categories?: PublicCategory[];
  onCategoryChange?: (category: string) => void;
};

const socialProfiles = [
  ["socialFacebook", "Facebook", "f", "social-facebook"],
  ["socialInstagram", "Instagram", "◎", "social-instagram"],
  ["socialX", "X", "𝕏", "social-x"],
  ["socialLinkedIn", "LinkedIn", "in", "social-linkedin"],
] as const;

export default function PublicFooter({ categories, onCategoryChange }: PublicFooterProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [remoteCategories, setRemoteCategories] = useState<PublicCategory[]>(
    catalogCategories.map((name) => ({
      name,
      count: catalogTools.filter((tool) => tool.category === name).length,
    })),
  );
  const visibleCategories = categories ?? remoteCategories;

  useEffect(() => {
    fetch("/api/social-links")
      .then((response) => response.ok ? response.json() : { links: {} })
      .then((data) => setSocialLinks(data.links && typeof data.links === "object" ? data.links : {}))
      .catch(() => setSocialLinks({}));
    if (!categories) {
      fetch("/api/categories")
        .then((response) => response.ok ? response.json() : { categories: catalogCategories })
        .then((data) => {
          if (Array.isArray(data.categories)) {
            setRemoteCategories(data.categories.filter((name: unknown): name is string => typeof name === "string").map((name: string) => ({
              name,
              count: catalogTools.filter((tool) => tool.category === name).length,
            })));
          }
        })
        .catch(() => undefined);
    }
  }, [categories]);

  return (
    <footer className="professional-footer">
      <div className="footer-inner">
        <div className="footer-brand-column">
          <Link href="/" aria-label="AIToolss home" className="footer-brand">
            <span className="light-brand-mark">A</span><span>AIToolss<span>.</span></span>
          </Link>
          <p>Useful tools for curious minds.</p>
          <div className="footer-socials" aria-label="Social media">
            {socialProfiles.map(([key, label, mark, className]) => socialLinks[key] ? (
              <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <span className={className}>{mark}</span>
              </a>
            ) : null)}
          </div>
          {socialProfiles.some(([key]) => !socialLinks[key]) && (
            <p className="footer-social-hint">Only configured official profile URLs are linked. Social URLs can be set in Admin Studio.</p>
          )}
        </div>
        <div>
          <h3>Categories</h3>
          <nav className="footer-link-list" aria-label="Top categories">
            {visibleCategories.slice(0, 6).map((category) => onCategoryChange ? (
              <button type="button" key={category.name} onClick={() => onCategoryChange(category.name)}>{category.name}</button>
            ) : (
              <Link key={category.name} href={`/?category=${encodeURIComponent(category.name)}#tools`}>{category.name}</Link>
            ))}
          </nav>
        </div>
        <div>
          <h3>Explore</h3>
          <nav className="footer-link-list" aria-label="Supporting pages">
            <Link href="/about">About</Link>
            <Link href="/contact-us">Contact Us</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AIToolss. All rights reserved.</span>
        <Link href="/admin-login">Admin</Link>
      </div>
    </footer>
  );
}
