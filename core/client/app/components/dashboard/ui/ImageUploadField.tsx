"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { sileo } from "sileo";
import { fetchConDespertar } from "@/app/lib/despertar";
import { ImagePlus, Loader2, X } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  placeholder?: string;
}

// Upload a file (stored by the backend and served from /uploads/...) or
// paste a URL. Either way the form just keeps the resulting URL string.
export default function ImageUploadField({ label, value, onChange, error, placeholder }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (file.size > MAX_BYTES) {
      sileo.error({ title: "Imagen demasiado grande", description: "El máximo es 5 MB." });
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetchConDespertar("/api/uploads", { method: "POST", body });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({ title: "No se pudo subir", description: data?.message ?? "Inténtalo nuevamente." });
        return;
      }

      onChange(data.url as string);
    } catch {
      sileo.error({ title: "Error de conexión", description: "No pudimos subir la imagen." });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase">{label}</span>

      {value && (
        <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md border border-black/10 bg-surface">
          {/* unoptimized: the URL may be any https host, not only the ones next.config allows. */}
          <Image src={value} alt="" fill unoptimized sizes="400px" className="object-cover" />
          <button
            type="button"
            aria-label="Quitar imagen"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "https://... o sube un archivo"}
          className="w-full min-w-0 rounded-md border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-black/10 px-3 text-xs font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Subiendo" : "Subir"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>
      <p className="mt-1 text-[11px] text-ink/40">JPG, PNG o WebP, hasta 5 MB.</p>
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}
