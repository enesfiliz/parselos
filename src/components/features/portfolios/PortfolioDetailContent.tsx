"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Eye,
  FileText,
  Kanban,
  MapPin,
  PenTool,
  Radar,
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
import { propertyKindLabel } from "@/lib/portfolios/portfolio-form";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { buildPortfolioOwnerWhatsAppUrl } from "@/lib/portfolios/portfolio-whatsapp-report";
import { cn } from "@/lib/utils";

type PortfolioDetailContentProps = {
  portfolio: AuthorizedPortfolioItem;
  variant?: "drawer" | "page";
  className?: string;
};

const QUICK_ACTIONS = [
  {
    label: "İmar Radarı",
    description: "Parsel ve imar sorgusu",
    href: "/imar-radari",
    icon: Radar,
  },
  {
    label: "Tapu AI",
    description: "Tapu belgesi analizi",
    href: "/tapu-ai",
    icon: FileText,
  },
  {
    label: "İlan Asistanı",
    description: "İlan metni üret",
    href: "/ilan-asistani",
    icon: PenTool,
  },
] as const;

export function PortfolioDetailContent({
  portfolio,
  variant = "page",
  className,
}: PortfolioDetailContentProps) {
  const yetki = getYetkiStatus(portfolio.yetkiRemainingDays);
  const listing = getListingBadge(portfolio.listingType);
  const imar = extractImarLabel(portfolio.title, portfolio.propertyKind);
  const adaParsel = extractAdaParsel(portfolio.title, portfolio.description);
  const mock = isMockPortfolio(portfolio.id);
  const dealStage = getDealStageBadge(portfolio.dealStageLabel);
  const lastActivity = formatPortfolioLastActivity(portfolio.lastActivityAt);
  const progressPct = Math.max(
    0,
    Math.min(
      100,
      Math.round((portfolio.yetkiRemainingDays / portfolio.yetkiTotalDays) * 100),
    ),
  );
  const whatsAppUrl = buildPortfolioOwnerWhatsAppUrl(portfolio);
  const heroHeight = variant === "drawer" ? "h-48" : "h-56 sm:h-64";

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className={cn("relative shrink-0 overflow-hidden", heroHeight)}>
        <PortfolioCoverImage
          item={portfolio}
          className="absolute inset-0"
          sizes={variant === "drawer" ? "512px" : "960px"}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

        <div className="absolute bottom-4 left-5 right-5 sm:left-6 sm:right-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                listing.className,
              )}
            >
              {portfolio.listingType}
            </span>
            <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
              {propertyKindLabel(portfolio.propertyKind)}
            </span>
            {mock ? (
              <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                Örnek veri
              </span>
            ) : null}
          </div>
          <p className="mt-3 font-inter text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {portfolio.priceFormatted}
          </p>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
        <section className="space-y-2">
          <h2 className="text-lg font-medium tracking-tight text-foreground sm:text-xl">
            {portfolio.title}
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} />
            {portfolio.location}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full border border-border/60 bg-parsel-elevated px-2.5 py-1 text-[11px] text-muted-foreground">
              İmar: {imar}
            </span>
            {adaParsel ? (
              <span className="rounded-full border border-border/60 bg-parsel-elevated px-2.5 py-1 text-[11px] text-muted-foreground">
                {adaParsel}
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                yetki.className,
              )}
            >
              {yetki.detail} · {yetki.label}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                dealStage.className,
              )}
            >
              {dealStage.label}
            </span>
          </div>
        </section>

        {portfolio.description ? (
          <section className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
            <p className="parsel-section-label text-[10px] text-muted-foreground">
              Açıklama
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {portfolio.description}
            </p>
          </section>
        ) : null}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Oda", value: portfolio.rooms },
            {
              label: "m²",
              value: portfolio.sqm > 0 ? portfolio.sqm.toLocaleString("tr-TR") : "—",
            },
            { label: "Yaş", value: portfolio.buildingAge },
            { label: "Tür", value: propertyKindLabel(portfolio.propertyKind) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-parsel-elevated px-3 py-3 text-center"
            >
              <p className="parsel-section-label text-[10px] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-foreground">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
            <p className="flex items-center gap-1.5 parsel-section-label text-[10px] text-muted-foreground">
              <User className="size-3" strokeWidth={1.5} />
              Mal sahibi
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {portfolio.ownerName}
            </p>
            {portfolio.ownerPhone ? (
              <a
                href={`tel:+${portfolio.ownerPhone}`}
                className="mt-0.5 inline-block text-xs text-primary hover:underline"
              >
                +{portfolio.ownerPhone}
              </a>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">Telefon yok</p>
            )}
            {!mock ? (
              <Link
                href="/customers"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Müşterilerde gör
                <ArrowUpRight className="size-3" />
              </Link>
            ) : null}
          </div>

          <div className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
            <p className="flex items-center gap-1.5 parsel-section-label text-[10px] text-muted-foreground">
              <Kanban className="size-3" strokeWidth={1.5} />
              Bağlı fırsat
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {portfolio.dealStageLabel ?? "Henüz fırsat oluşturulmadı"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Son aktivite: {lastActivity}
            </p>
            {!mock ? (
              <Link
                href="/deals"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Fırsatlar kanbanında aç
                <ArrowUpRight className="size-3" />
              </Link>
            ) : null}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/50 bg-parsel-elevated px-4 py-3">
            <p className="flex items-center gap-1.5 parsel-section-label text-[10px] text-muted-foreground">
              <Eye className="size-3" strokeWidth={1.5} />
              Gösterim
            </p>
            <p className="mt-2 text-xl font-medium tabular-nums text-foreground">
              {portfolio.showingsCount}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-parsel-elevated px-4 py-3">
            <p className="flex items-center gap-1.5 parsel-section-label text-[10px] text-muted-foreground">
              <FileText className="size-3" strokeWidth={1.5} />
              Teklif
            </p>
            <p className="mt-2 text-xl font-medium tabular-nums text-foreground">
              {portfolio.offersCount}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" strokeWidth={1.5} />
              Yetki süresi
            </p>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                portfolio.yetkiRemainingDays < 15
                  ? "text-destructive"
                  : portfolio.yetkiRemainingDays < 30
                    ? "text-parsel-gold"
                    : "text-muted-foreground",
              )}
            >
              {portfolio.yetkiRemainingDays} gün kaldı
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-parsel-sunken">
            <div
              className={cn(
                "h-full rounded-full",
                portfolio.yetkiRemainingDays < 15
                  ? "bg-destructive/70"
                  : "bg-primary/50",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </section>

        <section className="space-y-3">
          <p className="parsel-section-label text-[10px] text-muted-foreground">
            Araçlar ve aksiyonlar
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-start gap-3 rounded-xl border border-border/50 bg-parsel-elevated p-3 transition-colors hover:border-primary/20 hover:bg-primary/5"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-primary">
                  <action.icon className="size-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground group-hover:text-primary">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-parsel-elevated p-4">
          <p className="parsel-section-label text-[10px] text-muted-foreground">
            Notlar ve aktivite
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/80">
            <li className="flex items-start justify-between gap-3 border-b border-border/40 pb-2">
              <span>Kayıt güncellendi</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatPortfolioLastActivity(portfolio.updatedAt)}
              </span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <span>
                {portfolio.showingsCount} gösterim · {portfolio.offersCount} teklif aşaması
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{lastActivity}</span>
            </li>
          </ul>
        </section>

        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
        >
          Mal Sahibine Raporla
        </a>
      </div>
    </div>
  );
}
