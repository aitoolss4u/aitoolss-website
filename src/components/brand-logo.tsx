import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ className = "", size = 44 }: { className?: string; size?: number }) {
  return <Link href="/" className={className} aria-label="AIToolss home">
    <Image src="/brand/aitoolss-logo.png" alt="AIToolss" width={size} height={size} priority className="aitoolss-brand-image" />
  </Link>;
}
