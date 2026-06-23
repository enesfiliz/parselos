"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function NoiseTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-soft-light dark:opacity-[0.06]"
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
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.14, margin: "0px 0px -40px 0px" }}
      transition={{
        duration: 0.55,
        delay: delay / 1000,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
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
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
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
        "group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card",
        "transition-colors duration-200 hover:border-border",
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
        "bg-parsel-gold text-background transition-colors duration-500 hover:bg-parsel-gold/90",
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

export function ParallaxScroll({
  children,
  offset = 50,
  className,
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function ScaleOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  delayMultiplier = 50,
}: {
  children: ReactNode;
  className?: string;
  delayMultiplier?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delayMultiplier / 1000,
            delayChildren: 0,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: EASE_OUT,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RotateOnScroll({
  children,
  className,
  rotation = 5,
}: {
  children: ReactNode;
  className?: string;
  rotation?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [-rotation, rotation]);

  return (
    <motion.div ref={ref} style={{ rotate }} className={className}>
      {children}
    </motion.div>
  );
}

export function GlowOnHover({
  children,
  className,
  glowColor = "primary",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "gold";
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={
        isHovered
          ? {
              boxShadow: `0 0 30px -8px ${glowColor === "gold" ? "rgba(197,163,110,0.4)" : "rgba(74,107,47,0.4)"}`,
            }
          : {}
      }
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
