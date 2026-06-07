import { cn } from "@/lib/utils";

/** Minimal panel — keskin, profesyonel yüzey */
export const panelCard = cn(
  "rounded-xl border border-zinc-800/80 bg-[#18181b]",
);

export const panelCardHover = cn(
  "transition-colors duration-200 hover:border-zinc-700",
);

export const panelCardInteractive = cn(panelCard, panelCardHover);
