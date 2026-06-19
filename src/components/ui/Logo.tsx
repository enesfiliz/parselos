"use client";

import Image from "next/image";

import { useParselTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  /** Kept for API compatibility; maps to fetchPriority in Next 16. */
  priority?: boolean;
  markOnly?: boolean;
};

export function Logo({
  className = "h-10 w-auto max-w-[200px]",
  priority = false,
  markOnly = false,
}: LogoProps) {
  const { resolvedTheme } = useParselTheme();
  const src = markOnly ? "/brand/icon-mark.png" : "/brand/logo-horizontal.png";
  const darkSrc = markOnly ? "/brand/icon-mark.png" : "/brand/logo-horizontal-light.png";
  const activeSrc = resolvedTheme === "dark" ? darkSrc : src;
  const dimensions = markOnly
    ? { width: 1024, height: 1051 }
    : { width: 1420, height: 318 };

  return (
    <span
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="ParselOS"
      role="img"
    >
      <Image
        src={activeSrc}
        alt=""
        width={dimensions.width}
        height={dimensions.height}
        loading={priority ? "eager" : undefined}
        sizes={markOnly ? "40px" : "180px"}
        unoptimized
        fetchPriority={priority ? "high" : undefined}
        className="block h-full w-auto object-contain"
        draggable={false}
      />
    </span>
  );
}
