import Link from "next/link";
import PublicSiteChrome from "@/components/public-site-chrome";

export default function NotFound() {
  return (
    <PublicSiteChrome><main className="info-page flex items-center justify-center px-5 py-20">
      <section className="ds-panel w-full max-w-2xl px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="ds-eyebrow">ERROR 404 · PAGE NOT FOUND</p>
        <p aria-hidden="true" className="mt-5 text-7xl font-black tracking-tight sm:text-8xl">
          <span className="hero-gradient">404</span>
        </p>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          This page went off the map.
        </h1>
        <p className="ds-muted mx-auto mt-4 max-w-lg text-base leading-7">
          The link may be outdated, or the page may have moved. Head back to AIToolss and discover something useful instead.
        </p>
        <Link
          href="/"
          className="search-button mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold"
        >
          Back to homepage <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main></PublicSiteChrome>
  );
}
