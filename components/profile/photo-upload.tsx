"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  currentUrl: string | null;
};

export function PhotoUpload({ userId, currentUrl }: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleChange(file: File | undefined) {
    if (!file) return;
    setMessage(null);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setPreview(data.publicUrl);

    startTransition(async () => {
      const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId);
      setMessage(error ? error.message : "Photo updated.");
      if (!error) window.location.reload();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border bg-slate-100">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">No photo</div>
          )}
        </div>
        <div className="space-y-2">
          <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={isPending}>
            {isPending ? "Uploading..." : "Upload profile photo"}
          </button>
          <p className="text-sm text-slate-500">Recommended: square image, under 5 MB.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleChange(e.target.files?.[0])}
          />
        </div>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
