"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { GalleryPhoto } from "@/lib/gallery";

type PhotoGridProps = {
  photos: GalleryPhoto[];
  title: string;
};

export function PhotoGrid({ photos, title }: PhotoGridProps) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpen((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 md:gap-4">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setOpen(i)}
            className="group mb-3 block w-full overflow-hidden rounded-xl bg-black/5 break-inside-avoid md:mb-4"
            aria-label={`Abrir foto ${i + 1} de ${photos.length}`}
          >
            <Image
              src={photo.src}
              alt={`${title} — foto ${i + 1}`}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1152px) 368px, (min-width: 768px) 33vw, 50vw"
              className="h-auto w-full transition duration-300 group-hover:opacity-90"
            />
          </button>
        ))}
      </div>

      {current && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — foto ${open + 1} de ${photos.length}`}
          className="fixed inset-0 z-[200] bg-[#212121]/95"
          onClick={close}
        >
          <Image
            key={current.src}
            src={current.src}
            alt={`${title} — foto ${open + 1}`}
            width={current.width}
            height={current.height}
            sizes="90vw"
            className="absolute inset-0 m-auto max-h-[85svh] w-auto max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
            priority
          />

          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white/10"
          >
            <X className="size-3.5" /> Cerrar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-white/60 transition-colors hover:text-white sm:left-4"
          >
            <ArrowLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-white/60 transition-colors hover:text-white sm:right-4"
          >
            <ArrowRight className="size-6" />
          </button>
          <p className="absolute inset-x-0 bottom-6 text-center font-mono text-xs uppercase tracking-widest text-white/60">
            {open + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
