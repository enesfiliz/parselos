"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type RefObject } from "react";

import { cn } from "@/lib/utils";

function useGoldenParticles(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let raf = 0;

    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.6 + Math.random() * 2.2,
      speed: 0.00008 + Math.random() * 0.00018,
      drift: (Math.random() - 0.5) * 0.00012,
      alpha: 0.15 + Math.random() * 0.45,
    }));

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }

        const px = p.x * w;
        const py = p.y * h;
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, p.size * 6);
        gradient.addColorStop(0, `rgba(197, 163, 110, ${p.alpha})`);
        gradient.addColorStop(1, "rgba(197, 163, 110, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

function LandscapeSilhouette({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute inset-x-0 bottom-0 w-full", className)}
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-hill-far" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="hero-hill-near" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--parsel-gold)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--parsel-gold)" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <path
        fill="url(#hero-hill-far)"
        d="M0,220 C240,160 420,260 720,200 C960,155 1180,240 1440,180 L1440,320 L0,320 Z"
      />
      <path
        fill="url(#hero-hill-near)"
        d="M0,260 C320,210 520,290 840,240 C1080,205 1260,275 1440,250 L1440,320 L0,320 Z"
      />
      <path
        fill="color-mix(in srgb, var(--foreground) 6%, transparent)"
        d="M0,290 L120,275 L200,285 L340,268 L480,282 L620,270 L760,286 L920,272 L1080,284 L1240,276 L1440,288 L1440,320 L0,320 Z"
        opacity="0.5"
      />
    </svg>
  );
}

export function HeroCinematicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  useGoldenParticles(canvasRef);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-hero-mesh absolute inset-0" />
      <div className="landing-hero-aurora absolute inset-0" />
      <div className="landing-hero-light-bloom absolute inset-0 opacity-90" />

      {!prefersReducedMotion ? (
        <motion.div
          className="landing-hero-parallax-sky absolute inset-0"
          animate={{ scale: [1, 1.03, 1], opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <div className="landing-hero-parallax-sky absolute inset-0 opacity-60" />
      )}

      <div className="landing-parcel-field landing-hero-parcel-grid absolute inset-0 opacity-[0.14] dark:opacity-[0.12]" />
      <div className="landing-hero-contour absolute inset-0 opacity-45 dark:opacity-35" />
      <div className="landing-hero-coord-dots absolute inset-0 opacity-60 dark:opacity-45" />

      <div className="landing-hero-orbit absolute left-1/2 top-[10%] size-[min(920px,120vw)] -translate-x-1/2 rounded-full border border-primary/10" />
      <div className="landing-hero-orbit-reverse absolute left-1/2 top-[18%] size-[min(720px,100vw)] -translate-x-1/2 rounded-full border border-parsel-gold/10" />

      <div className="hero-cinematic-scan-plane absolute inset-x-[4%] top-[14%] h-[min(520px,62vh)] overflow-hidden rounded-[2rem] opacity-40 dark:opacity-30">
        <div className="hero-cinematic-scan-beam absolute inset-0" />
        <div className="hero-cinematic-scan-grid absolute inset-0" />
        <div className="hero-cinematic-radar-core absolute left-[62%] top-[38%] size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15" />
        <div className="landing-radar-sweep hero-cinematic-radar-sweep absolute inset-0 opacity-35" />
      </div>

      <LandscapeSilhouette className="hero-landscape-layer h-[38%] opacity-80" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-70 mix-blend-screen dark:opacity-50"
      />

      <div className="hero-cinematic-vignette absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
    </div>
  );
}
