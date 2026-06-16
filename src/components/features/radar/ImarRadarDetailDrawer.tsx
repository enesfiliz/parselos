"use client";

import { useEffect } from "react";
import {
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";

import {
  IMAR_CATEGORY_LABELS,
  IMAR_OFFICIAL_DISCLAIMER,
  IMAR_TRUST_LABELS,
  IMAR_TRUST_STYLES,
  formatImarRelativeTime,
  isValidSourceUrl,
  parseRegionParts,
} from "@/components/features/radar/imar-radar-ui-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ImarRadarItem } from "@/lib/radar/imar-radar-types";
import { cn } from "@/lib/utils";

type ImarRadarDetailDrawerProps = {
  open: boolean;
  item: ImarRadarItem | null;
  onOpenChange: (open: boolean) => void;
  onToggleTrack: (item: ImarRadarItem) => void;
  onMarkVerified: (item: ImarRadarItem) => void;
  onCreateTask: (item: ImarRadarItem) => void;
};

export function ImarRadarDetailDrawer({
  open,
  item,
  onOpenChange,
  onToggleTrack,
  onMarkVerified,
  onCreateTask,
}: ImarRadarDetailDrawerProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  if (!item) return null;

  const { district, city } = parseRegionParts(item.region);
  const sourceHref = isValidSourceUrl(item.sourceUrl) ? item.sourceUrl : null;

  return (
    <>
      <div
        role="presentation"
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "parsel-surface fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border/60 bg-parsel-panel shadow-[-24px_0_80px_rgba(0,0,0,0.18)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-6 py-5">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px]">
                {IMAR_CATEGORY_LABELS[item.category]}
              </Badge>
              <Badge className={cn("text-[10px]", IMAR_TRUST_STYLES[item.trustStatus])}>
                {IMAR_TRUST_LABELS[item.trustStatus]}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {item.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {district}, {city} · {item.source}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Detayı kapat"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <section className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
            <p className="parsel-section-label text-[10px] text-muted-foreground">
              Özet
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              {item.summary}
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Son güncelleme
              </p>
              <p className="mt-2 text-sm text-foreground">
                {formatImarRelativeTime(item.publishedAt)}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Takip durumu
              </p>
              <p className="mt-2 text-sm text-foreground">
                {item.isTracked ? "Aktif takip" : "Takip dışı"}
              </p>
            </div>
          </section>

          {item.verificationNote ? (
            <section className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
              <p className="parsel-section-label text-[10px] text-muted-foreground">
                Doğrulama notu
              </p>
              <p className="mt-2 text-sm text-foreground/85">{item.verificationNote}</p>
            </section>
          ) : null}

          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-foreground/85">{IMAR_OFFICIAL_DISCLAIMER}</p>
          </section>

          <section className="space-y-2">
            <p className="parsel-section-label text-[10px] text-muted-foreground">
              Kaynak
            </p>
            {sourceHref ? (
              <a
                href={sourceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-parsel-elevated px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <ExternalLink className="size-4" />
                Resmi kaynağı aç
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Kaynak eklenmedi</p>
            )}
          </section>

          <section className="space-y-2">
            <p className="parsel-section-label text-[10px] text-muted-foreground">
              İlgili modüller
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/portfolios"
                className="inline-flex h-9 items-center rounded-lg border border-border/60 px-3 text-xs font-medium text-primary hover:bg-primary/5"
              >
                Portföy vitrini
              </Link>
              <Link
                href="/imar-radari"
                className="inline-flex h-9 items-center rounded-lg border border-border/60 px-3 text-xs font-medium text-primary hover:bg-primary/5"
              >
                {city} takibi
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-2 border-t border-border/50 px-6 py-5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => onToggleTrack(item)}
            >
              {item.isTracked ? (
                <BookmarkCheck className="size-3.5" />
              ) : (
                <Bookmark className="size-3.5" />
              )}
              {item.isTracked ? "Takipte" : "Takibe al"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => onCreateTask(item)}
            >
              <CalendarPlus className="size-3.5" />
              Görev oluştur
            </Button>
          </div>
          {item.trustStatus !== "verified" ? (
            <Button
              type="button"
              className="h-10 w-full"
              onClick={() => onMarkVerified(item)}
            >
              Doğrulandı olarak işaretle
            </Button>
          ) : null}
        </div>
      </aside>
    </>
  );
}
