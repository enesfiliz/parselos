"use client";

import Image from "next/image";

import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { cn } from "@/lib/utils";

type PortfolioCoverImageProps = {
  item: Pick<AuthorizedPortfolioItem, "coverImageUrl" | "propertyKind" | "title">;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function imageGradient(kind: AuthorizedPortfolioItem["propertyKind"]) {
  switch (kind) {
    case "arsa":
      return "from-[#1a1510] via-[#12100d] to-[#0a0908]";
    case "ticari":
      return "from-[#101820] via-[#0c1014] to-[#080a0c]";
    default:
      return "from-[#151210] via-[#100e0c] to-[#0a0908]";
  }
}

export function PortfolioCoverImage({
  item,
  className,
  sizes = "(max-width: 768px) 100vw, 25vw",
  priority = false,
}: PortfolioCoverImageProps) {
  const cover = item.coverImageUrl?.trim();

  return (
    <div className={cn("relative overflow-hidden bg-background", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          imageGradient(item.propertyKind),
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(179,140,86,0.12),transparent_55%)]" />

      {cover ? (
        <Image
          src={cover}
          alt={item.title}
          fill
          priority={priority}
          sizes={sizes}
          unoptimized={cover.startsWith("data:")}
          className="object-cover"
        />
      ) : null}
    </div>
  );
}
