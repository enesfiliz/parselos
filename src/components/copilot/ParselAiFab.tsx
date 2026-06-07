"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ParselAiGlyph } from "@/components/copilot/ParselAiGlyph";
import { openParselCopilot } from "@/lib/copilot/copilot-events";

export function ParselAiFab() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      onClick={openParselCopilot}
      aria-label="Parsel AI komuta merkezini aç"
      className="group fixed bottom-8 right-8 z-40 flex w-auto shrink-0 cursor-pointer items-center gap-3 overflow-hidden rounded-full border border-[#b38c56]/30 bg-parsel-elevated px-6 py-3.5 shadow-[0_8px_30px_rgba(179,140,86,0.15)] transition-all duration-300 hover:scale-105 hover:border-parsel-gold/60"
    >
      <span
        aria-hidden
        className="parsel-pill-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-[#b38c56]/20"
      />
      <ParselAiGlyph size="md" className="relative z-10" />
      <span className="relative z-10 whitespace-nowrap text-sm font-semibold tracking-wide text-parsel-gold transition-colors group-hover:text-foreground">
        Parsel AI
      </span>
    </button>,
    document.body,
  );
}
