"use client";

import type { FormEvent } from "react";

export function PublishAllGalleryForm({
  action,
  draftCount,
}: {
  action: (formData: FormData) => void | Promise<void>;
  draftCount: number;
}) {
  function confirmPublish(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Publish all ${draftCount} saved draft items on the public homepage?`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={confirmPublish}>
      <button
        type="submit"
        disabled={draftCount === 0}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #d5caef",
          background: draftCount > 0 ? "#6d53d7" : "#f0edf5",
          color: draftCount > 0 ? "#fff" : "#8b8498",
          fontWeight: 800,
          cursor: draftCount > 0 ? "pointer" : "not-allowed",
        }}
      >
        Publish all {draftCount} drafts
      </button>
    </form>
  );
}
