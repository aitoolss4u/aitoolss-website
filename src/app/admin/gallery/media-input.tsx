"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UploadState = {
  mediaUrl: string;
  objectKey: string;
  originalObjectKey: string;
  thumbnailUrl: string;
  thumbnailKey: string;
  fileName: string;
  fileSize: number;
  storageProvider: "r2" | "supabase" | "external";
  supabaseMediaUrl: string;
  supabaseThumbnailUrl: string;
};

async function uploadR2Variant(blob: Blob, mediaType: "image" | "video", variant: string, name: string) {
  const response = await fetch("/api/admin/r2/upload-url", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ purpose: "gallery", mediaType, variant, fileName: name, contentType: blob.type, sizeBytes: blob.size }),
  });
  const signed = await response.json();
  if (!response.ok) throw new Error(signed.error || "Could not prepare the R2 upload.");
  const result = await fetch(signed.url, { method: "PUT", headers: { "Content-Type": blob.type }, body: blob });
  if (!result.ok) throw new Error("R2 upload failed (" + result.status + "). Check bucket CORS.");
  return signed as { key: string; publicUrl: string };
}

async function uploadSupabaseVariant(blob: Blob, variant: string, name: string) {
  const supabase = createClient();
  const safeName = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "media";
  const path = "gallery/" + crypto.randomUUID() + "/" + variant + "-" + safeName;
  const { data, error } = await supabase.storage.from("aitoolss-gallery").upload(path, blob, {
    cacheControl: "31536000", contentType: blob.type, upsert: false,
  });
  if (error) throw new Error(error.message || "Supabase Storage upload failed.");
  const { data: publicData } = supabase.storage.from("aitoolss-gallery").getPublicUrl(data.path);
  if (!publicData.publicUrl) throw new Error("Could not create the public media URL.");
  return { path: data.path, publicUrl: publicData.publicUrl };
}

function imageBlob(file: File, max: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Image processing is unavailable.")); return; }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => { URL.revokeObjectURL(url); blob ? resolve(blob) : reject(new Error("Could not create WebP image.")); }, "image/webp", .82);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not decode the image.")); };
    image.src = url;
  });
}

function posterBlob(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata"; video.muted = true; video.playsInline = true;
    const finish = (blob: Blob | null) => { URL.revokeObjectURL(url); resolve(blob); };
    video.onloadeddata = () => {
      const scale = Math.min(1, 400 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) { finish(null); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(finish, "image/webp", .78);
    };
    video.onerror = () => finish(null);
    video.src = url;
  });
}

const empty: UploadState = {
  mediaUrl: "", objectKey: "", originalObjectKey: "", thumbnailUrl: "", thumbnailKey: "",
  fileName: "", fileSize: 0, storageProvider: "external", supabaseMediaUrl: "", supabaseThumbnailUrl: "",
};

export default function GalleryMediaInput({ label = "Upload image or video", current }: { label?: string; current?: Partial<UploadState> }) {
  const [preview, setPreview] = useState("");
  const [kind, setKind] = useState<"image" | "video" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<UploadState>({ ...empty, ...current });
  const [copied, setCopied] = useState(false);
  const [storageMode, setStorageMode] = useState<"supabase" | "r2">(current?.storageProvider === "r2" ? "r2" : "supabase");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function selectFile(file: File | undefined) {
    if (!file) return;
    const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
    if (!type || !["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"].includes(file.type)) {
      setMessage("Supported: JPG, PNG, WebP, GIF, MP4 or WebM."); return;
    }
    if (file.size > 50 * 1024 * 1024) { setMessage("Files must be 50 MB or smaller in the easy Supabase Storage setup."); return; }

    setBusy(true); setKind(type); setMessage("Preparing secure upload…");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));

    try {
      const originalName = file.name;
      if (storageMode === "supabase") {
        setMessage("Uploading original to Supabase Storage…");
        const original = await uploadSupabaseVariant(file, "original", originalName);
        let display = original;
        let thumbnail: { path: string; publicUrl: string } | null = null;
        if (type === "image" && file.type !== "image/gif") {
          setMessage("Creating optimized image and thumbnail…");
          display = await uploadSupabaseVariant(await imageBlob(file, 1200), "optimized", originalName.replace(/\.[^.]+$/u, "") + ".webp");
          thumbnail = await uploadSupabaseVariant(await imageBlob(file, 400), "thumbnail", originalName.replace(/\.[^.]+$/u, "") + "-thumb.webp");
        } else if (type === "video") {
          const poster = await posterBlob(file);
          if (poster) thumbnail = await uploadSupabaseVariant(poster, "poster", originalName.replace(/\.[^.]+$/u, "") + "-poster.webp");
        }
        setValues({
          ...empty, mediaUrl: display.publicUrl, thumbnailUrl: thumbnail?.publicUrl ?? "",
          fileName: originalName, fileSize: file.size, storageProvider: "supabase",
          supabaseMediaUrl: display.publicUrl, supabaseThumbnailUrl: thumbnail?.publicUrl ?? "",
        });
        setMessage("Supabase Storage upload complete. Add a title and save the gallery item to publish it.");
      } else {
        setMessage("Uploading directly to Cloudflare R2…");
        const original = await uploadR2Variant(file, type, "original", originalName);
        let display = original;
        let thumbnail: { key: string; publicUrl: string } | null = null;
        if (type === "image" && file.type !== "image/gif") {
          display = await uploadR2Variant(await imageBlob(file, 1200), "image", "optimized", originalName.replace(/\.[^.]+$/u, "") + ".webp");
          thumbnail = await uploadR2Variant(await imageBlob(file, 400), "image", "thumbnail", originalName.replace(/\.[^.]+$/u, "") + "-thumb.webp");
        } else if (type === "video") {
          const poster = await posterBlob(file);
          if (poster) thumbnail = await uploadR2Variant(poster, "video", "poster", originalName.replace(/\.[^.]+$/u, "") + "-poster.webp");
        }
        const keys = [original.key, display.key, ...(thumbnail ? [thumbnail.key] : [])].filter((key, index, all) => all.indexOf(key) === index);
        const checked = await fetch("/api/admin/r2/verify", {
          method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ purpose: "gallery", keys }),
        });
        const check = await checked.json();
        if (!checked.ok || !check.verified) throw new Error(check.error || "R2 objects could not be verified.");
        setValues({
          ...empty, mediaUrl: display.publicUrl, objectKey: display.key, originalObjectKey: original.key,
          thumbnailUrl: thumbnail?.publicUrl ?? "", thumbnailKey: thumbnail?.key ?? "",
          fileName: originalName, fileSize: file.size, storageProvider: "r2",
        });
        setMessage("R2 objects verified. Add a title and save the gallery item to publish it.");
      }
    } catch (error) {
      setValues({ ...empty });
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally { setBusy(false); }
  }

  return (
    <div className="admin-r2-uploader">
      <label className="admin-option-control">Storage location
        <select value={storageMode} disabled={busy} onChange={(event) => setStorageMode(event.target.value as "supabase" | "r2")} aria-label="Storage location">
          <option value="supabase">Supabase Storage (easy setup)</option>
          <option value="r2">Cloudflare R2 (advanced)</option>
        </select>
      </label>
      <label className="admin-upload-control">{label}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={(event) => void selectFile(event.target.files?.[0])} />
      </label>
      {preview && <div className="admin-media-preview">{kind === "video" ? <video src={preview} controls muted playsInline preload="metadata" /> : <img src={preview} alt="Selected gallery media preview" />}</div>}
      {values.mediaUrl && !busy && <div className="admin-generated-url">
        <label>Public media URL<input type="url" readOnly value={values.mediaUrl} aria-label="Public media URL" /></label>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(values.mediaUrl); setCopied(true); setMessage("Public media URL copied. Save the gallery item to publish it."); } catch { setMessage("Select and copy the public media URL above."); } }}>{copied ? "Copied" : "Copy media URL"}</button>
      </div>}
      {values.thumbnailUrl && !busy && <div className="admin-generated-url">
        <label>Thumbnail / poster URL<input type="url" readOnly value={values.thumbnailUrl} aria-label="Thumbnail or poster URL" /></label>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(values.thumbnailUrl); setMessage("Thumbnail URL copied."); } catch { setMessage("Select and copy the thumbnail URL above."); } }}>Copy thumbnail URL</button>
      </div>}
      <p className="admin-help-text">Supabase Free includes 1 GB storage and 5 GB egress. Files are limited to 50 MB in this setup. Videos are stored as supplied, with no paid transcoding.</p>
      {message && <p role="status" className="admin-inline-status">{busy ? "Uploading… " : ""}{message}</p>}
      <input type="hidden" name="r2_media_url" value={values.objectKey ? values.mediaUrl : ""} />
      <input type="hidden" name="r2_object_key" value={values.objectKey} />
      <input type="hidden" name="r2_original_object_key" value={values.originalObjectKey} />
      <input type="hidden" name="r2_thumbnail_url" value={values.thumbnailKey ? values.thumbnailUrl : ""} />
      <input type="hidden" name="r2_thumbnail_key" value={values.thumbnailKey} />
      <input type="hidden" name="supabase_media_url" value={values.supabaseMediaUrl} />
      <input type="hidden" name="supabase_thumbnail_url" value={values.supabaseThumbnailUrl} />
      <input type="hidden" name="storage_provider" value={values.storageProvider} />
      <input type="hidden" name="original_file_name" value={values.fileName} />
      <input type="hidden" name="original_size_bytes" value={values.fileSize} />
    </div>
  );
}
