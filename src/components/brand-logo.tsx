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
      >
        <defs>
          <linearGradient id="aitoolss-logo-gradient" x1="18" y1="12" x2="158" y2="168" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="164" height="164" rx="42" fill="url(#aitoolss-logo-gradient)" />
        <path d="M90 34 38 139h25l11-24h32l11 24h25L90 34Zm0 48 7 16H83l7-16Z" fill="white" />
        <path d="m139 28 4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" fill="#D9F99D" />
      </svg>
      <span className="aitoolss-brand-wordmark">AIToolss<span>.</span></span>
    </Link>
  );
}
