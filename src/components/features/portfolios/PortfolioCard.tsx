"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { PortfolioCoverImage } from "@/components/features/portfolios/PortfolioCoverImage";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { propertyKindLabel } from "@/lib/portfolios/portfolio-form";
import { cn } from "@/lib/utils";

type PortfolioCardProps = {
  item: AuthorizedPortfolioItem;
  onDetails: (item: AuthorizedPortfolioItem) => void;
  onEdit: (item: AuthorizedPortfolioItem) => void;
  onDelete: (item: AuthorizedPortfolioItem) => void;
};

export function PortfolioCard({
  item,
  onDetails,
  onEdit,
  onDelete,
}: PortfolioCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSale = item.listingType === "SATILIK";
  const isUrgent = item.yetkiRemainingDays < 15;

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  return (
    <article
      className="parsel-surface group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 shadow-parsel-sm transition-all duration-200 hover:border-parsel-gold/35 hover:shadow-parsel-md"
      onClick={() => onDetails(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDetails(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative aspect-video overflow-hidden bg-background">
        <PortfolioCoverImage item={item} className="absolute inset-0" />

        <span
          className={cn(
            "absolute left-0 top-0 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
            isSale
              ? "rounded-br-xl bg-parsel-gold text-black"
              : "rounded-br-xl bg-emerald-500/90 text-black",
          )}
        >
          {item.listingType}
        </span>

        <span className="absolute right-3 top-3 rounded-full border border-border bg-black/35 px-2 py-0.5 text-[10px] font-medium text-foreground/65 backdrop-blur-sm">
          {propertyKindLabel(item.propertyKind)}
        </span>

        {isUrgent ? (
          <span className="absolute bottom-3 left-3 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-300">
            Yetki: {item.yetkiRemainingDays}g
          </span>
        ) : null}

        <div
          ref={menuRef}
          className="absolute right-3 top-12"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`${item.title} işlemleri`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-black/40 text-foreground/55 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-foreground/85"
          >
            <MoreHorizontal className="size-4" strokeWidth={1.75} />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 min-w-[148px] overflow-hidden rounded-xl border border-border bg-parsel-elevated py-1 shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground/75 transition-colors hover:bg-foreground/5"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(item);
                }}
              >
                <Pencil className="size-3.5" strokeWidth={1.75} />
                Düzenle
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-300/90 transition-colors hover:bg-red-500/10"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(item);
                }}
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
                Kaldır
              </button>
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 backdrop-blur-0 transition-all duration-500 group-hover:bg-black/30 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
          <span className="rounded-full border border-[#b38c56]/40 bg-parsel-gold/90 px-4 py-1.5 text-xs font-medium text-black">
            Detayları Gör
          </span>
        </div>
      </div>

      <div className="space-y-2 px-4 pb-3 pt-4">
        <p className="font-outfit text-2xl font-semibold tracking-tight text-foreground">
          {item.priceFormatted}
        </p>
        <h2 className="truncate text-sm font-medium text-foreground">{item.title}</h2>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
          <span className="truncate">{item.location}</span>
        </p>

        <div className="flex items-center gap-3 pt-1 text-[11px] text-foreground/45">
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" strokeWidth={1.5} />
            {item.showingsCount}
          </span>
          <span className="text-white/15">·</span>
          <span className="inline-flex items-center gap-1">
            <FileText className="size-3" strokeWidth={1.5} />
            {item.offersCount} teklif
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-border/50 bg-muted/10">
        <div className="border-r border-border/50 px-3 py-3 text-center">
          <p className="parsel-section-label text-[10px]">Oda</p>
          <p className="mt-1 text-xs font-medium text-foreground/80">{item.rooms}</p>
        </div>
        <div className="border-r border-border/50 px-3 py-3 text-center">
          <p className="parsel-section-label text-[10px]">m²</p>
          <p className="mt-1 text-xs font-medium text-foreground/80">
            {item.sqm > 0 ? item.sqm.toLocaleString("tr-TR") : "—"}
          </p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="parsel-section-label text-[10px]">Yaş</p>
          <p className="mt-1 text-xs font-medium text-foreground/80">{item.buildingAge}</p>
        </div>
      </div>
    </article>
  );
}
