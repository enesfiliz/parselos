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
      className="group fixed bottom-6 right-4 z-40 flex w-auto shrink-0 cursor-pointer items-center gap-3 overflow-hidden rounded-full border border-primary/25 bg-parsel-panel px-5 py-3 shadow-parsel-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 sm:bottom-8 sm:right-8 sm:px-6 sm:py-3.5"
    >
      <span
        aria-hidden
        className="parsel-pill-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-primary/10 to-primary/20"
      />
      <ParselAiGlyph size="md" className="relative z-10" />
      <span className="relative z-10 whitespace-nowrap text-sm font-semibold tracking-wide text-primary transition-colors group-hover:text-foreground">
        ParselAI
      </span>
    </button>,
    document.body,
  );
}
