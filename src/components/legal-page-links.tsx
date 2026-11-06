import Link from "next/link";

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/cookie-consent", label: "Cookie & Consent" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/about", label: "About AIToolss" },
];

const categoryLinks = [
  ["Writing", "Writing tools"],
  ["Images", "Image tools"],
  ["Productivity", "Productivity tools"],
  ["Coding", "Coding tools"],
  ["Marketing", "Marketing tools"],
  ["Education", "Education tools"],
  ["Business", "Business tools"],
  ["Career", "Career tools"],
] as const;

export default function LegalPageLinks() {
  return (
    <aside className="mt-10 rounded-2xl border border-[#e8e2f2] bg-white p-5 sm:p-6" aria-label="Related AIToolss pages">
      <h2 className="text-lg font-extrabold text-[#302641]">Related policies &amp; resources</h2>
      <p className="mt-2 text-sm leading-6 text-[#6e657d]">Read the connected AIToolss policies, learn about the website, or contact us if you need clarification.</p>
      <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal and company pages">
        {legalLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm font-semibold text-violet-700 underline underline-offset-4">{link.label}</Link>)}
      </nav>
      <div className="mt-5 border-t border-[#eee9f5] pt-4">
        <h3 className="text-sm font-bold text-[#413753]">Explore tool categories</h3>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="AIToolss tool categories">
          {categoryLinks.map(([slug, label]) => <Link key={slug} href={`/?category=${encodeURIComponent(slug)}#search`} className="text-sm text-[#625873] underline underline-offset-4">{label}</Link>)}
          <Link href="/categories" className="text-sm font-semibold text-violet-700 underline underline-offset-4">All categories</Link>
          <Link href="/types-of-tools" className="text-sm text-[#625873] underline underline-offset-4">Types of tools</Link>
        </nav>
      </div>
    </aside>
  );
}
