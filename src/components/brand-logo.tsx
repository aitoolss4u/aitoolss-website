import Link from "next/link";

export default function BrandLogo({ className = "", size = 44 }: { className?: string; size?: number }) {
  return (
    <Link
      href="/"
      className={`aitoolss-brand-link ${className}`}
      aria-label="AIToolss home"
    >
      <svg
        className="aitoolss-brand-image"
        width={size}
        height={size}
        viewBox="0 0 180 180"
        role="img"
        aria-label="AIToolss logo"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size, flex: "0 0 auto" }}
      >
        <rect x="8" y="8" width="164" height="164" rx="42" fill="#5146D8" />
        <path d="M90 34 38 139h25l11-24h32l11 24h25L90 34Zm0 48 7 16H83l7-16Z" fill="#FFFFFF" />
        <path d="m139 28 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" fill="#D9F99D" />
      </svg>
      <span className="aitoolss-brand-wordmark">AIToolss<span>.</span></span>
    </Link>
  );
}
