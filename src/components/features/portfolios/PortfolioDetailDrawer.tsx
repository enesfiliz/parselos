"use client";

import { useEffect } from "react";
import {
  Calendar,
  Eye,
  FileText,
  MapPin,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";

import { PortfolioCoverImage } from "@/components/features/portfolios/PortfolioCoverImage";
import { Button } from "@/components/ui/button";
import {
  propertyKindLabel,
} from "@/lib/portfolios/portfolio-form";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { buildPortfolioOwnerWhatsAppUrl } from "@/lib/portfolios/portfolio-whatsapp-report";
import { cn } from "@/lib/utils";

type PortfolioDetailDrawerProps = {
  open: boolean;
  portfolio: AuthorizedPortfolioItem | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (portfolio: AuthorizedPortfolioItem) => void;
  onDelete: (portfolio: AuthorizedPortfolioItem) => void;
};

export function PortfolioDetailDrawer({
  open,
  portfolio,
  onOpenChange,
  onEdit,
  onDelete,
}: PortfolioDetailDrawerProps) {
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

  if (!portfolio) return null;

  const isUrgent = portfolio.yetkiRemainingDays < 15;
  const progressPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (portfolio.yetkiRemainingDays / portfolio.yetkiTotalDays) * 100,
      ),
    ),
  );
  const whatsAppUrl = buildPortfolioOwnerWhatsAppUrl(portfolio);

  return (
    <>
      <div
        role="presentation"
        className={cn(
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/10 bg-[#0A0A0A] shadow-[-24px_0_80px_rgba(0,0,0,0.5)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="relative h-48 shrink-0 overflow-hidden">
          <PortfolioCoverImage
            item={portfolio}
            className="absolute inset-0"
            sizes="512px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
            aria-label="Detayı kapat"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>

          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-br-xl bg-[#b38c56] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                {portfolio.listingType}
              </span>
              <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm">
                {propertyKindLabel(portfolio.propertyKind)}
              </span>
            </div>
            <p className="mt-3 font-inter text-3xl font-medium tracking-tight text-white">
              {portfolio.priceFormatted}
            </p>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">
          <h2 className="text-lg font-medium tracking-tight text-white/90">
            {portfolio.title}
          </h2>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/50">
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} />
            {portfolio.location}
          </p>

          {portfolio.description ? (
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              {portfolio.description}
            </p>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Oda", value: portfolio.rooms },
              { label: "m²", value: portfolio.sqm > 0 ? portfolio.sqm.toLocaleString("tr-TR") : "—" },
              { label: "Yaş", value: portfolio.buildingAge },
              { label: "Tür", value: propertyKindLabel(portfolio.propertyKind) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-center"
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm text-white/75">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/35">
                <Eye className="size-3" strokeWidth={1.5} />
                Gösterim
              </p>
              <p className="mt-2 text-xl font-medium tabular-nums text-white/85">
                {portfolio.showingsCount}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/35">
                <FileText className="size-3" strokeWidth={1.5} />
                Teklif
              </p>
              <p className="mt-2 text-xl font-medium tabular-nums text-white/85">
                {portfolio.offersCount}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs text-white/45">
                <Calendar className="size-3.5" strokeWidth={1.5} />
                Yetki Belgesi Süresi
              </p>
              <span
                className={cn(
                  "text-xs font-medium tabular-nums",
                  isUrgent ? "text-red-400" : "text-white/55",
                )}
              >
                {portfolio.yetkiRemainingDays} gün kaldı
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#050505]">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isUrgent ? "bg-red-500/70" : "bg-[#b38c56]/60",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/35">
              <User className="size-3" strokeWidth={1.5} />
              Mal Sahibi
            </p>
            <p className="mt-2 text-sm font-medium text-white/85">
              {portfolio.ownerName}
            </p>
            {portfolio.ownerPhone ? (
              <p className="mt-0.5 text-xs text-white/45">{portfolio.ownerPhone}</p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 space-y-2 border-t border-white/5 px-6 py-5">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/15"
          >
            Mal Sahibine Raporla
          </a>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 border-white/10 bg-transparent text-white/75 hover:bg-white/5"
              onClick={() => {
                onOpenChange(false);
                onEdit(portfolio);
              }}
            >
              <Pencil className="size-3.5" strokeWidth={1.75} />
              Düzenle
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10"
              onClick={() => {
                onOpenChange(false);
                onDelete(portfolio);
              }}
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} />
              Kaldır
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
