import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ className = "", size = 44 }: { className?: string; size?: number }) {
  return <Link href="/" className={`aitoolss-brand-link ${className}`} aria-label="AIToolss home">
    <Image src="/brand/aitoolss-logo.png" alt="" aria-hidden="true" width={size} height={size} priority unoptimized className="aitoolss-brand-image" />
    <span className="aitoolss-brand-wordmark">AIToolss<span>.</span></span>
  </Link>;
}
