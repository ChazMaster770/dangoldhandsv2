"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { IMAGE_CHOICES } from "@/lib/images";

function isPreset(src: string) {
  return (IMAGE_CHOICES as readonly { src: string }[]).some((c) => c.src === src);
}

/**
 * Shared image picker for admin forms:
 * preset gallery • paste any URL • upload from device (stored in DB).
 */
export default function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (src: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "ההעלאה נכשלה");
        return;
      }
      onChange(data.url as string);
    } catch {
      setError("ההעלאה נכשלה — נסו שוב");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-white/50">תמונה</label>
      <select
        className="input-dark cursor-pointer"
        value={isPreset(value) ? value : "__custom"}
        onChange={(e) => {
          if (e.target.value !== "__custom") onChange(e.target.value);
        }}
      >
        {IMAGE_CHOICES.map((img) => (
          <option key={img.src} value={img.src}>
            {img.label}
          </option>
        ))}
        <option value="__custom">מקור אחר (קישור או העלאה)</option>
      </select>

      {!isPreset(value) && (
        <input
          className="input-dark mt-2"
          placeholder="הדביקו קישור תמונה (https://...)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
        />
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? "מעלה..." : "העלאת תמונה מהמכשיר / מהטלפון"}
        </button>
        <span className="text-[11px] text-white/35">jpg/png/webp עד 4MB</span>
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-red-400">{error}</p>}

      {value && (
        <span className="relative mt-2 block h-24 w-40 overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="תצוגה מקדימה" className="h-full w-full object-cover" />
        </span>
      )}
    </div>
  );
}
