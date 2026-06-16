"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

import { PortfolioCoverImage } from "@/components/features/portfolios/PortfolioCoverImage";
import {
  extractAdaParsel,
  extractImarLabel,
  formatPortfolioLastActivity,
  getDealStageBadge,
  getListingBadge,
  getYetkiStatus,
  isMockPortfolio,
} from "@/components/features/portfolios/portfolio-ui-helpers";
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
  const listing = getListingBadge(item.listingType);
  const yetki = getYetkiStatus(item.yetkiRemainingDays);
  const imar = extractImarLabel(item.title, item.propertyKind);
  const adaParsel = extractAdaParsel(item.title, item.description);
  const dealStage = getDealStageBadge(item.dealStageLabel);
  const lastActivity = formatPortfolioLastActivity(item.lastActivityAt);
  const mock = isMockPortfolio(item.id);

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
    <li className="parsel-surface overflow-hidden rounded-2xl border border-border/60 bg-parsel-panel shadow-parsel-sm">
      <div className="flex gap-3 p-3">
        <button
          type="button"
          onClick={() => onDetails(item)}
          className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl border border-border/60"
        >
          <PortfolioCoverImage item={item} className="absolute inset-0" sizes="96px" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onDetails(item)}
              className="min-w-0 text-left"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {item.title}
                </p>
                {mock ? (
                  <span className="rounded-full border border-border/60 bg-parsel-elevated px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    Örnek
                  </span>
                ) : null}
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{item.location}</span>
              </p>
            </button>

            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                aria-label={`${item.title} işlemleri`}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/20 hover:bg-accent hover:text-foreground"
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
                      onDetails(item);
                    }}
                  >
                    <Eye className="size-3.5" strokeWidth={1.75} />
                    Detay
                  </button>
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-destructive transition-colors hover:bg-destructive/10"
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
          </div>

          <p className="mt-2 text-base font-semibold text-parsel-gold">{item.priceFormatted}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                listing.className,
              )}
            >
              {listing.label}
            </span>
            <span className="inline-flex rounded-full border border-border/60 bg-parsel-elevated px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {propertyKindLabel(item.propertyKind)}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                yetki.className,
              )}
            >
              {yetki.detail}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                dealStage.className,
              )}
            >
              {dealStage.label}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>İmar: {imar}</span>
            <span>Ada/Parsel: {adaParsel ?? "—"}</span>
            <span>m²: {item.sqm > 0 ? item.sqm.toLocaleString("tr-TR") : "—"}</span>
            <span className="inline-flex items-center gap-1">
              <User className="size-3" strokeWidth={1.5} />
              {item.ownerName}
            </span>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            Son aktivite: {lastActivity}
          </p>
        </div>
      </div>
    </li>
  );
}
