import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getR2ConfigurationStatus } from "@/lib/r2";
import { updateGalleryBackup } from "../gallery/actions";

export const metadata = {
  title: "R2 & Drive backups | AIToolss Admin",
  robots: { index: false, follow: false },
};

type BackupItem = {
  id: string;
  title: string | null;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string | null;
  original_file_name: string | null;
  original_size_bytes: number | null;
  storage_provider: string | null;
  r2_object_key: string | null;
  r2_original_object_key: string | null;
  backup_google_drive_url: string | null;
  backup_status: string | null;
  backup_saved_at: string | null;
  backup_confirmed_at: string | null;
  created_at: string;
};

const statusLabel: Record<string, string> = {
  backup_pending: "Backup pending",
  backup_link_saved: "Drive link saved",
  backup_confirmed: "Backup confirmed",
  backup_missing: "Backup missing",
};

function formatBytes(value: number | null) {
  const bytes = Number(value ?? 0);
  if (!bytes) return "Original file size not recorded";
  return bytes >= 1024 * 1024
    ? (bytes / (1024 * 1024)).toFixed(1) + " MB"
    : (bytes / 1024).toFixed(1) + " KB";
}

export default async function AdminBackupsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("gallery_items")
    .select("id,title,media_type,media_url,thumbnail_url,original_file_name,original_size_bytes,storage_provider,r2_object_key,r2_original_object_key,backup_google_drive_url,backup_status,backup_saved_at,backup_confirmed_at,created_at")
    .order("created_at", { ascending: false });

  const r2 = getR2ConfigurationStatus();
  const missingMetadata = Boolean(error && (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /column .* does not exist|schema cache/i.test(error.message ?? "")
  ));
  const rows = (items ?? []) as BackupItem[];
  const summary = {
    total: rows.length,
    pending: rows.filter((item) => (item.backup_status ?? "backup_pending") === "backup_pending").length,
    saved: rows.filter((item) => item.backup_status === "backup_link_saved").length,
    confirmed: rows.filter((item) => item.backup_status === "backup_confirmed").length,
    missing: rows.filter((item) => item.backup_status === "backup_missing").length,
  };

  const errorText: Record<string, string> = {
    "invalid-id": "The gallery item ID is invalid.",
    load: "Could not load the saved backup status. Check Supabase permissions.",
    "backup-url": "Enter a valid Google Drive sharing URL. Confirm it only after opening and checking the file.",
    save: "The backup details could not be saved. Check that the R2/Drive metadata migration is applied.",
  };

  return (
    <main className="admin-gallery-page admin-backups-page" style={{ minHeight: "100vh", background: "#faf9ff", color: "#28233f", padding: "clamp(1rem,2.5vw,2.5rem)" }}>
      <div className="admin-gallery-container" style={{ width: "100%", maxWidth: "none", margin: 0 }}>
        <Link href="/admin" className="admin-backup-page-link">← Back to Admin Studio</Link>
        <header className="admin-backups-header">
          <p>AIToolss / STORAGE</p>
          <h1>R2 &amp; Google Drive backups</h1>
          <p>R2 stores and delivers the website's public images/videos. Google Drive is an optional manual backup for original files. A saved link is not marked confirmed until you open and check the file.</p>
          <Link href="/admin/gallery" className="admin-backup-page-link">Open AI Creations Gallery ↗</Link>
        </header>

        {params.saved && <p className="admin-backup-success" role="status">Backup details saved successfully.</p>}
        {params.error && <p className="admin-backup-error" role="alert">{errorText[params.error] ?? "The request could not be completed."}</p>}

        <section className="admin-backup-status-panel">
          <div>
            <h2>Cloudflare R2 readiness</h2>
            {r2.configured ? (
              <p className="admin-ready-message">R2 environment variables are present in this deployment. Upload a small test file from AI Creations Gallery to verify bucket access and the public delivery domain.</p>
            ) : (
              <>
                <p className="admin-warning-message">R2 uploads cannot work in this Vercel environment until the following server-only variables are configured:</p>
                <ul>{r2.missing.map((name) => <li key={name}><code>{name}</code></li>)}</ul>
                <p>Set these in Vercel → Project → Settings → Environment Variables, then redeploy the Preview or Production environment you are testing. Never use a NEXT_PUBLIC_ prefix for R2 credentials.</p>
              </>
            )}
          </div>
          <div className="admin-backup-migration-note">
            <strong>Supabase metadata migration</strong>
            <p>If this page cannot read the gallery rows, apply <code>supabase/migrations/202610310003_r2_media_and_drive_backups.sql</code> in Supabase SQL Editor after the Phase 13, Phase 14 and Phase 15 migrations.</p>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Open Supabase Dashboard ↗</a>
          </div>
        </section>

        <section className="admin-backup-summary-grid" aria-label="Backup status summary">
          {[
            ["Gallery items", summary.total],
            ["Backup pending", summary.pending],
            ["Drive link saved", summary.saved],
            ["Backup confirmed", summary.confirmed],
            ["Backup missing", summary.missing],
          ].map(([label, value]) => (
            <article key={label}><span>{label}</span><strong>{value}</strong></article>
          ))}
        </section>

        <div className="admin-backup-toolbar">
          <div><h2>Media backup records</h2><p>Upload original files to Google Drive yourself, paste a sharing link, then save or confirm it.</p></div>
          <a href="/api/admin/gallery/backup-manifest">↓ Export backup CSV</a>
        </div>

        {error ? (
          <div className="admin-migration-warning" role="alert">
            <strong>{missingMetadata ? "R2 / Drive metadata migration has not been applied." : "Gallery backup records could not be loaded."}</strong>
            <p>{missingMetadata
              ? "Apply 202610310003_r2_media_and_drive_backups.sql in Supabase SQL Editor. It adds the storage provider, R2 object keys, original file metadata and Google Drive backup columns; existing gallery records are preserved."
              : "Check the Phase 13 gallery migration, R2 metadata migration and your administrator role."}</p>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Open Supabase Dashboard ↗</a>
          </div>
        ) : rows.length === 0 ? (
          <div className="admin-backup-empty">No gallery items are saved yet. Upload images/videos from <Link href="/admin/gallery">AI Creations Gallery</Link>, then manage their Drive backups here.</div>
        ) : (
          <div className="admin-backup-list">
            {rows.map((item) => {
              const status = item.backup_status ?? "backup_pending";
              return (
                <article className="admin-backup-card" key={item.id}>
                  <div className="admin-backup-preview">
                    {item.media_type === "video"
                      ? <video src={item.media_url} poster={item.thumbnail_url ?? undefined} controls playsInline preload="none" />
                      : <img src={item.thumbnail_url || item.media_url} alt={item.title || "Gallery media"} />}
                  </div>
                  <div className="admin-backup-details">
                    <div className="admin-backup-item-heading">
                      <div><h3>{item.title || item.original_file_name || "Untitled media"}</h3><p>{item.media_type.toUpperCase()} · {formatBytes(item.original_size_bytes)} · {item.storage_provider ?? "external"} storage</p></div>
                      <span className={"admin-backup-status " + status}>{statusLabel[status] ?? status}</span>
                    </div>
                    <p className="admin-backup-object-key">R2 object: <code>{item.r2_original_object_key || item.r2_object_key || "No R2 object recorded (external/legacy media)"}</code></p>
                    <form action={updateGalleryBackup} className="admin-backup-form">
                      <input type="hidden" name="id" value={item.id} />
                      <label>Google Drive sharing URL
                        <input name="backup_google_drive_url" type="url" defaultValue={item.backup_google_drive_url ?? ""} placeholder="https://drive.google.com/file/d/…" />
                      </label>
                      <label>Backup status
                        <select name="backup_status" defaultValue={status === "backup_confirmed" ? "backup_link_saved" : status}>
                          <option value="backup_pending">Backup pending</option>
                          <option value="backup_link_saved">Drive link saved</option>
                          <option value="backup_missing">Backup missing</option>
                        </select>
                      </label>
                      <label className="admin-backup-confirm">
                        <input type="checkbox" name="backup_confirmed_now" />
                        I opened and checked this Drive file now
                      </label>
                      <div className="admin-backup-save-row">
                        <small>
                          {item.backup_saved_at ? "Link saved " + new Date(item.backup_saved_at).toLocaleString() : "No Drive link saved yet."}
                          {item.backup_confirmed_at ? " · Last confirmed " + new Date(item.backup_confirmed_at).toLocaleString() : ""}
                        </small>
                        <button type="submit">Save backup details</button>
                      </div>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
