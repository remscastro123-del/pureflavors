"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { photo } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * Product photos with tap-to-zoom (Jakob's Law: every store lets you open the photo full screen).
 * In the viewer: tap the photo to toggle 2× zoom and drag/scroll to pan, arrow keys or buttons to page, Escape to close.
 * Pinch-zoom works natively on phones.
 */
export function ProductGallery({ photos, name }: { photos: string[]; name: string }) {
  const [i, setI] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const n = photos.length;
  const go = (d: number) => {
    setZoomed(false);
    setI((x) => (x + d + n) % n);
  };

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const open = () => {
    setZoomed(false);
    dialog.current?.showModal();
  };

  return (
    <div className="flex flex-col gap-3">
      <Card variant="sunken" className="relative">
        <button type="button" onClick={open} className="group block cursor-zoom-in" aria-label={`Open photo ${i + 1} of ${n} full screen`}>
          <img src={photo(photos[i], "lg")} alt={`PURE ${name} — photo ${i + 1} of ${n}`} width={1200} height={900} fetchPriority="high" className="aspect-[4/3] w-full object-cover" />
          <span className="absolute bottom-3 right-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-white/70 px-3 text-[13px] font-medium text-ink shadow-[0_4px_14px_-4px_rgb(0_0_0/.2)] ring-1 ring-white/60 backdrop-blur-xl transition group-hover:bg-white/85" aria-hidden>
            <Maximize2 className="h-4 w-4" /> Zoom
          </span>
        </button>
      </Card>

      {n > 1 && (
        <div className="grid grid-cols-5 gap-2" role="group" aria-label="Product photos">
          {photos.map((src, k) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show photo ${k + 1} of ${n}`}
              aria-pressed={i === k}
              className={cn("overflow-hidden rounded-[14px] border-2 bg-[#f4f6f5] transition", i === k ? "border-amber-600" : "border-transparent opacity-80 hover:opacity-100")}
            >
              <img src={photo(src)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialog}
        aria-label={`${name} photos`}
        onClose={() => setZoomed(false)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#1d1712]/90 p-0 text-white backdrop-blur-2xl backdrop:bg-black/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-[calc(12px+env(safe-area-inset-top))]">
            <p className="text-[14px] tabular-nums text-white/80">
              {name} · {i + 1} / {n}
            </p>
            <button type="button" onClick={() => dialog.current?.close()} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close photo viewer">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className={cn("relative min-h-0 flex-1 touch-pan-x touch-pan-y touch-pinch-zoom", zoomed ? "overflow-auto" : "flex items-center justify-center overflow-hidden")}>
            <img
              src={photo(photos[i], "lg")}
              alt={`PURE ${name} — photo ${i + 1} of ${n}`}
              onClick={() => setZoomed((z) => !z)}
              className={cn("select-none", zoomed ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain")}
              style={zoomed ? { width: "min(2400px, 200vw)" } : undefined}
              draggable={false}
            />
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-xl hover:bg-white/25" aria-label="Previous photo">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-xl hover:bg-white/25" aria-label="Next photo">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <p className="pb-[calc(12px+env(safe-area-inset-bottom))] pt-2 text-center text-[13px] text-white/70">Tap the photo to zoom. Pinch on phones.</p>
        </div>
      </dialog>
    </div>
  );
}
