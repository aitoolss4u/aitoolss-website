"use client";

import type { FormEvent } from "react";

export function DeleteGalleryForm({ action, id }: { action: (formData: FormData) => void | Promise<void>; id: string }) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Delete this gallery item permanently? This cannot be undone.")) event.preventDefault();
  }
  return <form action={action} onSubmit={confirmDelete} style={{ marginTop: 10 }}>
    <input type="hidden" name="id" value={id} />
    <button style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #f1bcbc", color: "#a12727" }}>Delete item</button>
  </form>;
}
