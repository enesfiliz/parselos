import { cn } from "@/lib/utils";

/** Minimal panel — tema uyumlu yüzey */
export const panelCard = cn(
  "rounded-xl border border-border bg-parsel-panel",
);

export const panelCardHover = cn(
  "transition-colors duration-200 hover:border-border/80",
);

export const panelCardInteractive = cn(panelCard, panelCardHover);
