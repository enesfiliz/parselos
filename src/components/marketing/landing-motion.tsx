"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export function NoiseTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.05] mix-blend-soft-light"
      aria-hidden
    >
      <svg className="h-full w-full" preserveAspectRatio="none">
        <filter id="landing-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#landing-noise)" />
      </svg>
    </div>
  );
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        className,
        visible
          ? "animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-1000"
          : "translate-y-4 opacity-0",
      )}
      style={{ animationDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

export function RevealOnMount({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-1000",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SpotlightCard({
  children,
  className,
  accent = "gold",
}: {
  children: ReactNode;
  className?: string;
  accent?: "gold" | "primary";
}) {
  const ref = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  }

  function handleMouseLeave() {
    setSpot((prev) => ({ ...prev, active: false }));
  }

  const spotlightColor =
    accent === "gold"
      ? "rgba(197, 163, 110, 0.12)"
      : "rgba(84, 114, 54, 0.14)";

  return (
    <article
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#18181b]",
        "transition-colors duration-200 hover:border-zinc-700",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(520px circle at ${spot.x}px ${spot.y}px, ${spotlightColor}, transparent 42%)`,
        }}
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </article>
  );
}

export function ShineButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "landing-btn-shine relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg px-10 text-sm font-semibold",
        "bg-parsel-gold text-parsel-bg transition-colors duration-500 hover:bg-parsel-gold/90",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="landing-btn-shine-sweep pointer-events-none absolute inset-0 z-20"
        aria-hidden
      />
    </Link>
  );
}
