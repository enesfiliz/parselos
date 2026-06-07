"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type FsboImageCarouselProps = {
  images: string[];
  title: string;
};

export function FsboImageCarousel({ images, title }: FsboImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-parsel-sunken text-sm text-muted-foreground">
        Görsel bulunamadı
      </div>
    );
  }

  function goTo(index: number) {
    if (total <= 0) return;
    const next = (index + total) % total;
    setActiveIndex(next);
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex]}
          alt={`${title} — ${activeIndex + 1}`}
          className="h-56 w-full object-cover sm:h-64"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-1.5 text-foreground backdrop-blur transition-colors hover:bg-black/70"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-1.5 text-foreground backdrop-blur transition-colors hover:bg-black/70"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}

        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-foreground backdrop-blur">
          {activeIndex + 1} / {total}
        </span>
      </div>

      {total > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all",
                index === activeIndex
                  ? "border-[#b38c56] ring-1 ring-[#b38c56]/40"
                  : "border-border opacity-75 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${title} küçük ${index + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
