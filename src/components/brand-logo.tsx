import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ className = "", size = 44 }: { className?: string; size?: number }) {
  return (
    <Link
      href="/"
      className={`aitoolss-brand-link ${className}`}
      aria-label="AIToolss home"
    >
      <Image
        src="/brand/aitoolss-logo.webp"
        alt="AIToolss logo"
        width={size}
        height={size}
        priority
        unoptimized
        className="aitoolss-brand-image"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    </Link>
  );
}
