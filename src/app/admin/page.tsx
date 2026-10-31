"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { loadAdminData, saveAdminData } from "./actions";

type Category = { id: string; name: string; slug: string; description: string; metaTitle: string; metaDescription: string; tags: string; imageUrl: string; visible: boolean };
type AdminSettings = {
  siteName: string; siteDescription: string; defaultMetaTitle: string; defaultMetaDescription: string;
  primaryColor: string; accentColor: string; backgroundColor: string; font: string;
  maintenanceMode: boolean; showRoadmapTools: boolean; enableAnalytics: boolean; enableAds: boolean;
  socialFacebook: string; socialInstagram: string; socialYouTube: string; socialLinkedIn: string; socialX: string;
};
type AdminData = { settings: AdminSettings; categories: Category[] };

const defaultSettings: AdminSettings = {
  siteName: "AIToolss", siteDescription: "Discover useful AI tools and smart utilities to help you create, learn and get things done.",
  defaultMetaTitle: "AIToolss — Discover AI Tools That Help You Do More",
  defaultMetaDescription: "Explore useful AI tools for writing, images, productivity, coding, marketing, education, business and career.",
  primaryColor: "#7657FF", accentColor: "#35D9FF", backgroundColor: "#FAF9FF", font: "Arial",
  maintenanceMode: false, showRoadmapTools: true, enableAnalytics: false, enableAds: false,
  socialFacebook: "", socialInstagram: "", socialYouTube: "", socialLinkedIn: "", socialX: "",
};
const defaultCategories: Category[] = [
  { id: "writing", name: "Writing", slug: "writing", description: "Words, ideas and clarity.", metaTitle: "AI Writing Tools", metaDescription: "Discover useful AI writing tools and text utilities.", tags: "writing, text, summarizer, words", imageUrl: "", visible: true },
  { id: "images", name: "Images", slug: "images", description: "Visuals and image utilities.", metaTitle: "AI Image Tools", metaDescription: "Explore image tools and browser-based image utilities.", tags: "images, image compressor, visuals", imageUrl: "", visible: true },
  { id: "productivity", name: "Productivity", slug: "productivity", description: "Work smarter every day.", metaTitle: "AI Productivity Tools", metaDescription: "Find tools to organize work and improve everyday productivity.", tags: "productivity, workflow, planning", imageUrl: "", visible: true },
  { id: "coding", name: "Coding", slug: "coding", description: "Build and understand.", metaTitle: "AI Coding Tools", metaDescription: "Discover tools for coding, understanding code and development.", tags: "coding, developer, code", imageUrl: "", visible: true },
  { id: "marketing", name: "Marketing", slug: "marketing", description: "Content that connects.", metaTitle: "AI Marketing Tools", metaDescription: "Explore tools for marketing, content and audience growth.", tags: "marketing, content, social media", imageUrl: "", visible: true },
  { id: "education", name: "Education", slug: "education", description: "Learn with less friction.", metaTitle: "AI Education Tools", metaDescription: "Find helpful tools for studying, learning and organizing notes.", tags: "education, study, learning", imageUrl: "", visible: true },
  { id: "business", name: "Business", slug: "business", description: "Ideas into action.", metaTitle: "AI Business Tools", metaDescription: "Discover useful AI tools for business tasks and new ideas.", tags: "business, startups, planning", imageUrl: "", visible: true },
  { id: "career", name: "Career", slug: "career", description: "Your next opportunity.", metaTitle: "AI Career Tools", metaDescription: "Explore tools for resumes, job searches and career development.", tags: "career, resume, jobs", imageUrl: "", visible: true },
];
const defaults: AdminData = { settings: defaultSettings, categories: defaultCategories };

const menu = [
  { id: "overview", label: "Overview", icon: "◫" }, { id: "categories", label: "Categories & tags", icon: "▦" },
  { id: "seo", label: "SEO controls", icon: "⌕" }, { id: "design", label: "Design studio", icon: "◈" },
  { id: "settings", label: "Site settings", icon: "⚙" }, { id: "social", label: "Social links", icon: "↗" },
] as const;
type Section = (typeof menu)[number]["id"];

function Field({ label, value, onChange, hint, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; hint?: string; placeholder?: string; multiline?: boolean }) {
  return <label className="admin-field"><span>{label}</span>{multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} /> : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}{hint && <small>{hint}</small>}</label>;
}
function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="admin-toggle"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i aria-hidden="true" /></label>;
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<AdminData>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("writing");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    let active = true;
    loadAdminData().then((result) => {
      if (!active) return;
      if (result.ok) {
        const remoteCategories = result.categories.length ? result.categories : defaultCategories;
        setData({
          settings: { ...defaultSettings, ...(result.settings ?? {}) },
          categories: remoteCategories,
        });
        setSelectedCategory(remoteCategories[0]?.id ?? "");
        setSaved(true);
        setStatusMessage("Loaded saved configuration from Supabase.");
      } else {
        setStatusMessage(result.message);
      }
      setLoaded(true);
    }).catch(() => {
      if (!active) return;
      setStatusMessage("Could not connect to Supabase. Check project configuration and migration.");
      setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  const activeCategory = useMemo(() => data.categories.find((category) => category.id === selectedCategory) ?? data.categories[0], [data.categories, selectedCategory]);
  const updateSettings = (patch: Partial<AdminSettings>) => { setData((current) => ({ ...current, settings: { ...current.settings, ...patch } })); setSaved(false); };
  const updateCategory = (id: string, patch: Partial<Category>) => { setData((current) => ({ ...current, categories: current.categories.map((category) => category.id === id ? { ...category, ...patch } : category) })); setSaved(false); };
  const save = async () => {
    setSaved(false);
    setStatusMessage("Saving changes to Supabase…");
    try {
      const result = await saveAdminData(data);
      setSaved(result.ok);
      setStatusMessage(result.message);
    } catch {
      setStatusMessage("Save failed. Check your session and Supabase configuration.");
    }
  };
  const reset = async () => {
    if (!window.confirm("Replace the saved configuration with the starter defaults? This will update the shared Supabase configuration.")) return;
    setData(defaults);
    setSelectedCategory("writing");
    setSaved(false);
    setStatusMessage("Saving starter defaults…");
    try {
      const result = await saveAdminData(defaults);
      setSaved(result.ok);
      setStatusMessage(result.message);
    } catch {
      setStatusMessage("Reset failed. Check your session and Supabase configuration.");
    }
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "aitoolss-admin-settings.json"; anchor.click(); URL.revokeObjectURL(url);
  };
  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const slug = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug || data.categories.some((category) => category.slug === slug)) { window.alert("Please choose a unique category name."); return; }
    const item: Category = { id: slug, name, slug, description: "", metaTitle: name + " AI Tools", metaDescription: "Discover useful " + name.toLowerCase() + " tools on AIToolss.", tags: name.toLowerCase(), imageUrl: "", visible: true };
    setData((current) => ({ ...current, categories: [...current.categories, item] })); setSelectedCategory(item.id); setNewCategoryName(""); setSaved(false);
  };
  const deleteCategory = (id: string) => {
    if (!window.confirm("Delete this category from the local Admin Studio configuration?")) return;
    setData((current) => ({ ...current, categories: current.categories.filter((category) => category.id !== id) }));
    if (selectedCategory === id) setSelectedCategory(data.categories.find((category) => category.id !== id)?.id ?? "");
    setSaved(false);
  };

  return (
    <main className="admin-shell" style={{ "--admin-primary": data.settings.primaryColor, "--admin-accent": data.settings.accentColor, "--admin-bg": data.settings.backgroundColor, fontFamily: data.settings.font } as React.CSSProperties}>
      <aside className="admin-sidebar">
        <div className="admin-brand"><BrandLogo size={48} /><span>CONTROL CENTER</span></div>
        <p className="admin-nav-label">WORKSPACE</p><Link href="/admin/gallery" className="admin-gallery-link">AI Creations Gallery ↗</Link><Link href="/admin/pages" className="admin-gallery-link">Company &amp; Legal pages ↗</Link><Link href="/admin/messages" className="admin-gallery-link">Contact inbox ↗</Link>
        <nav aria-label="Admin sections">{menu.map((item) => <button key={item.id} onClick={() => setSection(item.id)} className={section === item.id ? "active" : ""}><span>{item.icon}</span>{item.label}{section === item.id && <b>•</b>}</button>)}</nav>
        <div className="admin-sidebar-bottom"><span className="admin-status-dot" /> Supabase connected <small>Database connection depends on your project setup</small><Link href="/">← Back to website</Link></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><span className="admin-eyebrow">AIToolss / CONTROL CENTER</span><h1>{menu.find((item) => item.id === section)?.label}</h1></div><div className="admin-top-actions"><span className="admin-draft-state">{saved ? "Saved to Supabase" : "Unsaved changes"}</span><button className="admin-save" onClick={save} disabled={!loaded}>Save changes</button></div></header>
        <div className="admin-notice"><span>ⓘ</span><p><strong>Supabase-backed Admin Studio.</strong> Changes save to the shared database. Public homepage rendering and live SEO/theme publishing still need a separate integration step. {statusMessage}</p></div>

        {section === "overview" && <div className="admin-content">
          <div className="admin-welcome"><div><span className="admin-eyebrow">YOUR SITE, AT A GLANCE</span><h2>Good morning, creator<span>.</span></h2><p>Manage categories and site configuration from one place. Save changes to your shared Supabase database.</p></div><div className="admin-welcome-orb">A<span>.</span></div></div>
          <div className="admin-stats"><article><span>Directory categories</span><strong>{data.categories.length.toString().padStart(2, "0")}</strong><small>Editable in Categories & tags</small></article><article><span>SEO fields</span><strong>{data.categories.length + 2}</strong><small>Titles and descriptions configured</small></article><article><span>Brand colors</span><strong>03</strong><small>Primary, accent and background</small></article><article><span>Ad placements</span><strong>{data.settings.enableAds ? "ON" : "OFF"}</strong><small>Starter default stays disabled</small></article></div>
          <div className="admin-card"><div className="admin-card-heading"><div><h3>Quick actions</h3><p>Jump straight into the controls you need most.</p></div></div><div className="admin-quick-grid">{menu.slice(1).map((item) => <button key={item.id} onClick={() => setSection(item.id)}><span>{item.icon}</span><strong>{item.label}</strong><small>Open controls ↗</small></button>)}</div></div>
          <div className="admin-card"><div className="admin-card-heading"><div><h3>Publishing readiness</h3><p>These items still need backend integration before launch.</p></div><span className="admin-pill">PRE-LAUNCH</span></div><ul className="admin-checklist"><li><span>✓</span> Editable category and SEO configuration</li><li><span>✓</span> Theme controls and settings preview</li><li><span>○</span> Secure admin authentication and role permissions</li><li><span>○</span> Shared persistent database and live publishing</li><li><span>○</span> Audit log, backups and production validation</li></ul></div>
        </div>}

        {section === "categories" && <div className="admin-content admin-two-column">
          <div className="admin-card"><div className="admin-card-heading"><div><h3>Categories</h3><p>Manage directory taxonomy, visibility and SEO metadata.</p></div><span className="admin-pill">{data.categories.length} TOTAL</span></div>
            <div className="admin-add-row"><input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }} placeholder="New category name" aria-label="New category name" /><button onClick={addCategory}>+ Add</button></div>
            <div className="admin-category-list">{data.categories.map((category) => <button key={category.id} className={selectedCategory === category.id ? "selected" : ""} onClick={() => setSelectedCategory(category.id)}><span className="admin-category-symbol">{category.name.slice(0, 1).toUpperCase()}</span><span><strong>{category.name}</strong><small>/{category.slug}</small></span><span className={category.visible ? "admin-visible" : "admin-hidden"}>{category.visible ? "Visible" : "Hidden"}</span></button>)}</div>
          </div>
          <div className="admin-card">{activeCategory ? <><div className="admin-card-heading"><div><h3>Edit category</h3><p>Changes are written to Supabase when you save.</p></div><button className="admin-danger" onClick={() => deleteCategory(activeCategory.id)}>Delete</button></div>
            <Field label="Category name" value={activeCategory.name} onChange={(value) => updateCategory(activeCategory.id, { name: value })} />
            <Field label="URL slug" value={activeCategory.slug} onChange={(value) => updateCategory(activeCategory.id, { slug: value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} hint="Use lowercase letters, numbers and hyphens." />
            <Field label="Short description" value={activeCategory.description} onChange={(value) => updateCategory(activeCategory.id, { description: value })} multiline />
            <Field label="Meta title" value={activeCategory.metaTitle} onChange={(value) => updateCategory(activeCategory.id, { metaTitle: value })} hint={activeCategory.metaTitle.length + " characters · aim for around 50–60."} />
            <Field label="Meta description" value={activeCategory.metaDescription} onChange={(value) => updateCategory(activeCategory.id, { metaDescription: value })} multiline hint={activeCategory.metaDescription.length + " characters · aim for around 140–160."} />
            <Field label="Tags (comma-separated)" value={activeCategory.tags} onChange={(value) => updateCategory(activeCategory.id, { tags: value })} />
            <Field label="Category image URL (HTTPS)" value={activeCategory.imageUrl} onChange={(value) => updateCategory(activeCategory.id, { imageUrl: value })} hint="Optional public image URL. For secure uploads, use the gallery storage uploader." />
            <Toggle label="Show category" description="Controls whether the category is visible to public visitors through the category API." checked={activeCategory.visible} onChange={(value) => updateCategory(activeCategory.id, { visible: value })} />
          </> : <p>No categories yet. Add one to get started.</p>}</div>
        </div>}

        {section === "seo" && <div className="admin-content">
          <div className="admin-section-intro"><span className="admin-eyebrow">SEARCH APPEARANCE</span><h2>SEO essentials<span>.</span></h2><p>Set your default metadata and social sharing identity. These values are stored in Supabase; Next.js page metadata is not yet dynamically wired to them.</p></div>
          <div className="admin-card admin-form-card"><Field label="Site name" value={data.settings.siteName} onChange={(value) => updateSettings({ siteName: value })} /><Field label="Default meta title" value={data.settings.defaultMetaTitle} onChange={(value) => updateSettings({ defaultMetaTitle: value })} hint={data.settings.defaultMetaTitle.length + " characters · keep it concise and descriptive."} /><Field label="Default meta description" value={data.settings.defaultMetaDescription} onChange={(value) => updateSettings({ defaultMetaDescription: value })} multiline hint={data.settings.defaultMetaDescription.length + " characters."} /><Field label="Site description" value={data.settings.siteDescription} onChange={(value) => updateSettings({ siteDescription: value })} multiline /><div className="admin-seo-preview"><span>SEARCH RESULT PREVIEW</span><strong>{data.settings.defaultMetaTitle || "Page title"}</strong><small>aitoolss.com</small><p>{data.settings.defaultMetaDescription || "Your meta description will appear here."}</p></div></div>
          <div className="admin-card"><div className="admin-card-heading"><div><h3>Category metadata</h3><p>Quick SEO coverage across all directory categories.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Category</th><th>Meta title</th><th>Description length</th></tr></thead><tbody>{data.categories.map((category) => <tr key={category.id}><td>{category.name}</td><td>{category.metaTitle || "—"}</td><td>{category.metaDescription.length} chars</td></tr>)}</tbody></table></div><button className="admin-secondary" onClick={() => setSection("categories")}>Edit category SEO ↗</button></div>
        </div>}

        {section === "design" && <div className="admin-content">
          <div className="admin-section-intro"><span className="admin-eyebrow">BRAND SYSTEM</span><h2>Make it yours<span>.</span></h2><p>Change colors and typography for the public website. Saved theme values are published through the public settings endpoint.</p></div>
          <div className="admin-design-grid"><div className="admin-card"><div className="admin-card-heading"><div><h3>Brand colors</h3><p>Choose a palette for the public website and control center. Background must stay light so text remains readable.</p></div></div>{([{key:"primaryColor",label:"Primary color"},{key:"accentColor",label:"Accent color"},{key:"backgroundColor",label:"Background"}] as const).map((item) => <label key={item.key} className="admin-color-row"><span>{item.label}<small>{data.settings[item.key]}</small></span><input type="color" value={data.settings[item.key]} onChange={(e) => updateSettings({ [item.key]: e.target.value })} /></label>)}<Field label="Font family" value={data.settings.font} onChange={(value) => updateSettings({ font: value })} hint="Enter a system font name such as Arial, Georgia, or Verdana." /></div>
            <div className="admin-card admin-live-preview" style={{ background: data.settings.backgroundColor, fontFamily: data.settings.font }}><span className="admin-eyebrow">LIVE PREVIEW</span><div className="admin-preview-logo" style={{ background: data.settings.primaryColor }}>A</div><h3 style={{ color: "#f7f8ff" }}>{data.settings.siteName}<span style={{ color: data.settings.accentColor }}>.</span></h3><p style={{ color: "#9ba5bd" }}>A little preview of your chosen brand style.</p><button style={{ background: data.settings.primaryColor }}>Primary button</button><div className="admin-preview-accent" style={{ background: data.settings.accentColor }} /></div>
          </div>
        </div>}

        {section === "settings" && <div className="admin-content">
          <div className="admin-section-intro"><span className="admin-eyebrow">SITE OPERATIONS</span><h2>Controls & preferences<span>.</span></h2><p>Switches below save your preferred configuration. They do not activate third-party services by themselves.</p></div>
          <div className="admin-card admin-form-card"><Toggle label="Maintenance mode" description="Saved maintenance preference; a separate maintenance landing mode is not enabled." checked={data.settings.maintenanceMode} onChange={(value) => updateSettings({ maintenanceMode: value })} /><Toggle label="Show roadmap tools" description="Preference for whether upcoming tools should appear in the directory." checked={data.settings.showRoadmapTools} onChange={(value) => updateSettings({ showRoadmapTools: value })} /><Toggle label="Analytics" description="Keep disabled until an analytics provider and privacy notice are configured." checked={data.settings.enableAnalytics} onChange={(value) => updateSettings({ enableAnalytics: value })} /><Toggle label="Advertising / AdSense" description="Recommended to remain off until publisher approval, consent and placements are ready." checked={data.settings.enableAds} onChange={(value) => updateSettings({ enableAds: value })} /></div>
          <div className="admin-card"><div className="admin-card-heading"><div><h3>Configuration tools</h3><p>Export a backup of the current configuration or restore starter defaults.</p></div></div><div className="admin-button-row"><button className="admin-secondary" onClick={exportData}>↓ Export JSON backup</button><button className="admin-danger" onClick={reset}>Reset local settings</button></div></div>
        </div>}

        {section === "social" && <div className="admin-content">
          <div className="admin-section-intro"><span className="admin-eyebrow">COMMUNITY & BRAND</span><h2>Social destinations<span>.</span></h2><p>Replace starter URLs with the real official AIToolss profiles before launch.</p></div>
          <div className="admin-card admin-form-card"><Field label="Facebook URL" value={data.settings.socialFacebook} onChange={(value) => updateSettings({ socialFacebook: value })} /><Field label="Instagram URL" value={data.settings.socialInstagram} onChange={(value) => updateSettings({ socialInstagram: value })} /><Field label="YouTube URL" value={data.settings.socialYouTube} onChange={(value) => updateSettings({ socialYouTube: value })} /><Field label="LinkedIn URL" value={data.settings.socialLinkedIn} onChange={(value) => updateSettings({ socialLinkedIn: value })} /><Field label="X URL" value={data.settings.socialX} onChange={(value) => updateSettings({ socialX: value })} /><p className="admin-inline-warning">These URLs are published to the public footer after you save.</p></div>
        </div>}

        <footer className="admin-footer"><span>AIToolss Admin Studio · Phase 9</span><div><button onClick={exportData}>Export config</button><button onClick={reset}>Reset</button></div></footer>
      </section>
    </main>
  );
}
