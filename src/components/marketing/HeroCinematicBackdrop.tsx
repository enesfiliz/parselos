"use client";

import { cn } from "@/lib/utils";

function TerrainGraph({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute inset-x-0 bottom-0 w-full", className)}
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-terrain-primary" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="hero-terrain-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--parsel-gold)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--parsel-gold)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--parsel-gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 270 C180 225 320 255 520 218 C750 176 900 230 1110 194 C1250 170 1340 178 1440 148"
        fill="none"
        stroke="url(#hero-terrain-gold)"
        strokeWidth="1.5"
      />
      <path
        d="M0,252 C250,202 410,302 700,238 C940,185 1170,260 1440,214 L1440,360 L0,360 Z"
        fill="url(#hero-terrain-primary)"
      />
      <path
        d="M0,302 L128,286 L226,296 L374,274 L518,294 L672,280 L826,300 L982,282 L1128,298 L1282,286 L1440,304 L1440,360 L0,360 Z"
        fill="color-mix(in srgb, var(--foreground) 5%, transparent)"
      />
    </svg>
  );
}

export function HeroCinematicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-antigravity-sky absolute inset-0" />
      <div className="landing-antigravity-field absolute inset-0" />
      <div className="landing-antigravity-horizon absolute inset-x-[4%] top-[13%] h-[min(560px,64vh)] rounded-[2rem]" />
      <div className="landing-antigravity-grid absolute inset-0" />
      <div className="landing-antigravity-contours absolute inset-0" />

      <div className="absolute left-[8%] top-[18%] hidden h-px w-52 bg-gradient-to-r from-transparent via-primary/35 to-transparent lg:block" />
      <div className="absolute right-[7%] top-[28%] hidden h-px w-64 bg-gradient-to-r from-transparent via-parsel-gold/30 to-transparent lg:block" />
      <div className="absolute left-[52%] top-[9%] hidden h-[38rem] w-px bg-gradient-to-b from-transparent via-border/40 to-transparent lg:block" />

      <TerrainGraph className="h-[42%] opacity-95" />

      <div className="hero-cinematic-vignette absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
    </div>
  );
}
