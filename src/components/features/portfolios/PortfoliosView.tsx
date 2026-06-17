"use client";

import {
  Briefcase,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  createPortfolioAction,
  deletePortfolioAction,
  updatePortfolioAction,
} from "@/app/actions/portfolios";
import { PortfolioAddDrawer } from "@/components/features/portfolios/PortfolioAddDrawer";
import { PortfolioCard } from "@/components/features/portfolios/PortfolioCard";
import { PortfolioCoverImage } from "@/components/features/portfolios/PortfolioCoverImage";
import { PortfolioDeleteDialog } from "@/components/features/portfolios/PortfolioDeleteDialog";
import { PortfolioDetailDrawer } from "@/components/features/portfolios/PortfolioDetailDrawer";
import {
  computePortfolioMetrics,
  extractImarLabel,
  formatPortfolioLastActivity,
  getDealStageBadge,
  getListingBadge,
  getYetkiStatus,
  isMockPortfolio,
  matchesPortfolioFilters,
  matchesPortfolioQuery,
  METRIC_CARD,
  type KindFilter,
  type ListingFilter,
} from "@/components/features/portfolios/portfolio-ui-helpers";
import { Button } from "@/components/ui/button";
import { isDemoDataEnabledClient } from "@/lib/demo-mode";
import { propertyKindLabel } from "@/lib/portfolios/portfolio-form";
import type { PortfolioFormValues } from "@/lib/portfolios/portfolio-form";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { cn } from "@/lib/utils";

type PortfoliosViewProps = {
  portfolios: AuthorizedPortfolioItem[];
  openSheetOnMount?: boolean;
};

const LISTING_FILTERS: { value: ListingFilter; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "SATILIK", label: "Satılık" },
  { value: "KIRALIK", label: "Kiralık" },
];

const KIND_FILTERS: { value: KindFilter; label: string }[] = [
  { value: "ALL", label: "Tüm türler" },
  { value: "konut", label: "Konut" },
  { value: "arsa", label: "Arsa" },
  { value: "ticari", label: "Ticari" },
];

function PortfolioEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="parsel-surface rounded-2xl border border-dashed border-border/60 bg-parsel-panel px-6 py-16 text-center shadow-parsel-sm">
      <Briefcase className="mx-auto size-10 text-primary/70" strokeWidth={1.25} />
      <p className="mt-4 text-sm font-semibold text-foreground">
        Henüz portföy eklenmedi
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        İlk yetkili mülkünüzü ekleyin; fiyat, bölge, imar ve yetki takibi burada
        başlar.
      </p>
      <Button
        type="button"
        onClick={onAdd}
        className="mt-6 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="size-4" strokeWidth={2} />
        İlk Portföyü Ekle
      </Button>
    </div>
  );
}

export function PortfoliosView({
  portfolios,
  openSheetOnMount = false,
}: PortfoliosViewProps) {
  const router = useRouter();
  const [listingFilter, setListingFilter] = useState<ListingFilter>("ALL");
  const [kindFilter, setKindFilter] = useState<KindFilter>("ALL");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AuthorizedPortfolioItem[]>(portfolios);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activePortfolio, setActivePortfolio] =
    useState<AuthorizedPortfolioItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPortfolio, setDetailPortfolio] =
    useState<AuthorizedPortfolioItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePortfolio, setDeletePortfolio] =
    useState<AuthorizedPortfolioItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setItems(portfolios));
  }, [portfolios]);

  const openCreateSheet = useCallback(() => {
    setFormMode("create");
    setActivePortfolio(null);
    setFormOpen(true);
  }, []);

  const openEditSheet = useCallback((portfolio: AuthorizedPortfolioItem) => {
    setFormMode("edit");
    setActivePortfolio(portfolio);
    setFormOpen(true);
  }, []);

  const openDetails = useCallback(
    (portfolio: AuthorizedPortfolioItem) => {
      if (isMockPortfolio(portfolio.id)) {
        setDetailPortfolio(portfolio);
        setDetailOpen(true);
        return;
      }
      router.push(`/portfolios/${portfolio.id}`);
    },
    [router],
  );

  const openDeleteDialog = useCallback((portfolio: AuthorizedPortfolioItem) => {
    setDeletePortfolio(portfolio);
    setDeleteOpen(true);
  }, []);

  useEffect(() => {
    if (openSheetOnMount) {
      queueMicrotask(() => {
        openCreateSheet();
        router.replace("/portfolios");
      });
    }
  }, [openSheetOnMount, openCreateSheet, router]);

  const metrics = useMemo(() => computePortfolioMetrics(items), [items]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesPortfolioQuery(item, query) &&
          matchesPortfolioFilters(item, listingFilter, kindFilter),
      ),
    [items, query, listingFilter, kindFilter],
  );

  async function handlePortfolioSubmit(values: PortfolioFormValues) {
    setIsSaving(true);
    try {
      if (formMode === "edit" && activePortfolio) {
        const isMock = isMockPortfolio(activePortfolio.id);
        const result = isMock
          ? await createPortfolioAction(values)
          : await updatePortfolioAction(activePortfolio.id, values);

        if (!result.success) {
          toast.error("Güncelleme başarısız", { description: result.error });
          return;
        }

        setItems((current) => {
          if (isMock) {
            return [
              result.data,
              ...current.filter((item) => item.id !== activePortfolio.id),
            ];
          }
          return current.map((item) =>
            item.id === result.data.id ? result.data : item,
          );
        });

        if (detailPortfolio?.id === activePortfolio.id) {
          setDetailPortfolio(result.data);
        }

        toast.success(isMock ? "Portföy veritabanına taşındı" : "Portföy güncellendi", {
          description: `${result.data.title} kaydı yenilendi.`,
        });
      } else {
        const result = await createPortfolioAction(values);
        if (!result.success) {
          toast.error("Kayıt başarısız", { description: result.error });
          return;
        }

        setItems((current) => [result.data, ...current]);
        toast.success("Portföy kaydedildi", {
          description: `${result.data.title} veritabanına eklendi.`,
        });
      }

      setFormOpen(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletePortfolio || isDeleting) return;

    setIsDeleting(true);
    try {
      const isMock = isMockPortfolio(deletePortfolio.id);
      if (isMock) {
        setItems((current) =>
          current.filter((item) => item.id !== deletePortfolio.id),
        );
        toast.success("Portföy kaldırıldı", {
          description: `${deletePortfolio.title} vitrinden silindi.`,
        });
      } else {
        const result = await deletePortfolioAction(deletePortfolio.id);
        if (!result.success) {
          toast.error("Silme başarısız", { description: result.error });
          return;
        }

        setItems((current) =>
          current.filter((item) => item.id !== deletePortfolio.id),
        );
        toast.success("Portföy kaldırıldı", {
          description: `${deletePortfolio.title} veritabanından silindi.`,
        });
        router.refresh();
      }

      if (detailPortfolio?.id === deletePortfolio.id) {
        setDetailOpen(false);
        setDetailPortfolio(null);
      }

      setDeleteOpen(false);
      setDeletePortfolio(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const isTrulyEmpty = items.length === 0;
  const isFilterEmpty = !isTrulyEmpty && filtered.length === 0;

  return (
    <div className="min-h-full bg-parsel-canvas">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="parsel-section-label text-primary">Portföy merkezi</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="parsel-page-title text-foreground">Yetkili Portföyler</h1>
              <span className="inline-flex items-center rounded-full border border-border/60 bg-parsel-panel px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-parsel-sm">
                {items.length} kayıt
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Yetkili mülklerinizi tek vitrinde yönetin. Tür, bölge, fiyat, imar ve yetki
              durumunu anlık takip edin.
            </p>
          </div>
          {!isTrulyEmpty ? (
            <Button
              type="button"
              onClick={openCreateSheet}
              disabled={isSaving}
              className="h-11 shrink-0 gap-1.5 bg-primary px-5 text-primary-foreground shadow-parsel-sm hover:bg-primary/90"
            >
              <Plus className="size-4" strokeWidth={2} />
              Portföy Ekle
            </Button>
          ) : null}
        </header>

        {!isTrulyEmpty ? (
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <article className={METRIC_CARD}>
              <p className="text-[11px] font-medium text-muted-foreground">Toplam portföy</p>
              <p className="parsel-metric-value mt-2 text-foreground">{metrics.total}</p>
            </article>
            <article className={METRIC_CARD}>
              <p className="text-[11px] font-medium text-muted-foreground">Satılık</p>
              <p className="parsel-metric-value mt-2 text-parsel-gold">{metrics.forSale}</p>
            </article>
            <article className={METRIC_CARD}>
              <p className="text-[11px] font-medium text-muted-foreground">Kiralık</p>
              <p className="parsel-metric-value mt-2 text-primary">{metrics.forRent}</p>
            </article>
            <article className={METRIC_CARD}>
              <p className="text-[11px] font-medium text-muted-foreground">Yetki kritik</p>
              <p className="parsel-metric-value mt-2 text-foreground">{metrics.urgentYetki}</p>
            </article>
          </section>
        ) : null}

        {!isTrulyEmpty ? (
          <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="relative min-w-0">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Başlık, bölge, fiyat, imar veya ada/parsel ile ara..."
                  className="h-11 w-full rounded-xl border border-border/60 bg-parsel-elevated pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex flex-wrap gap-2">
                  {LISTING_FILTERS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setListingFilter(item.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        listingFilter === item.value
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-border/60 bg-parsel-elevated text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {KIND_FILTERS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setKindFilter(item.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        kindFilter === item.value
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-border/60 bg-parsel-elevated text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {filtered.length} portföy listeleniyor
              {query.trim() ? ` · “${query.trim()}” araması` : ""}
              {items.some((item) => isMockPortfolio(item.id)) && isDemoDataEnabledClient()
                ? " · demo kayıtları gösteriliyor"
                : ""}
            </p>
          </section>
        ) : null}

        {isTrulyEmpty ? (
          <PortfolioEmptyState onAdd={openCreateSheet} />
        ) : isFilterEmpty ? (
          <div className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel px-6 py-12 text-center shadow-parsel-sm">
            <p className="text-sm font-medium text-foreground">
              Eşleşen portföy bulunamadı
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Arama veya filtreyi değiştirmeyi deneyin.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-border/60 bg-parsel-panel shadow-parsel-sm md:block">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.75fr)_minmax(0,0.65fr)_minmax(0,0.55fr)_minmax(0,0.75fr)_minmax(0,0.7fr)_minmax(0,0.65fr)_minmax(0,0.6fr)_auto] gap-3 border-b border-border/60 bg-parsel-elevated/80 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Portföy</span>
                  <span>Bölge</span>
                  <span>Tür / İmar</span>
                  <span>Mal sahibi</span>
                  <span>m²</span>
                  <span>Fiyat</span>
                  <span>Durum</span>
                  <span>Fırsat</span>
                  <span>Son aktivite</span>
                  <span className="text-right">İşlem</span>
                </div>
                <ul>
                  {filtered.map((item) => (
                    <PortfolioTableRow
                      key={item.id}
                      item={item}
                      onDetails={openDetails}
                      onEdit={openEditSheet}
                      onDelete={openDeleteDialog}
                    />
                  ))}
                </ul>
              </div>
            </div>

            <ul className="flex flex-col gap-3 md:hidden">
              {filtered.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  onDetails={openDetails}
                  onEdit={openEditSheet}
                  onDelete={openDeleteDialog}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <PortfolioAddDrawer
        open={formOpen}
        mode={formMode}
        portfolio={activePortfolio}
        isSubmitting={isSaving}
        onOpenChange={setFormOpen}
        onSubmit={handlePortfolioSubmit}
      />

      <PortfolioDetailDrawer
        open={detailOpen}
        portfolio={detailPortfolio}
        onOpenChange={setDetailOpen}
        onEdit={openEditSheet}
        onDelete={openDeleteDialog}
      />

      <PortfolioDeleteDialog
        open={deleteOpen}
        portfolio={deletePortfolio}
        isDeleting={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteOpen(false);
          setDeletePortfolio(null);
        }}
        onConfirm={confirmDelete}
      />

      {isSaving || isDeleting ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-full border border-border bg-parsel-elevated/95 px-4 py-2 text-xs text-muted-foreground shadow-xl">
          <Loader2 className="size-3.5 animate-spin" />
          {isDeleting ? "Siliniyor..." : "Kaydediliyor..."}
        </div>
      ) : null}
    </div>
  );
}

function PortfolioTableRow({
  item,
  onDetails,
  onEdit,
  onDelete,
}: {
  item: AuthorizedPortfolioItem;
  onDetails: (item: AuthorizedPortfolioItem) => void;
  onEdit: (item: AuthorizedPortfolioItem) => void;
  onDelete: (item: AuthorizedPortfolioItem) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const listing = getListingBadge(item.listingType);
  const yetki = getYetkiStatus(item.yetkiRemainingDays);
  const imar = extractImarLabel(item.title, item.propertyKind);
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
    <li className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.75fr)_minmax(0,0.65fr)_minmax(0,0.55fr)_minmax(0,0.75fr)_minmax(0,0.7fr)_minmax(0,0.65fr)_minmax(0,0.6fr)_auto] items-center gap-3 border-b border-border/50 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-foreground/[0.02]">
      <button
        type="button"
        onClick={() => onDetails(item)}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border/60">
          <PortfolioCoverImage item={item} className="absolute inset-0" sizes="48px" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
            {mock ? (
              <span className="rounded-full border border-border/60 bg-parsel-elevated px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                Örnek
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {propertyKindLabel(item.propertyKind)}
          </p>
        </div>
      </button>

      <p className="min-w-0 truncate text-sm text-foreground/90">{item.location}</p>

      <div className="min-w-0">
        <p className="truncate text-sm text-foreground/90">{imar}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {propertyKindLabel(item.propertyKind)}
        </p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm text-foreground/90">{item.ownerName}</p>
        {item.ownerPhone ? (
          <p className="truncate text-[10px] text-muted-foreground">
            +{item.ownerPhone}
          </p>
        ) : null}
      </div>

      <p className="text-sm tabular-nums text-foreground/90">
        {item.sqm > 0 ? item.sqm.toLocaleString("tr-TR") : "—"}
      </p>

      <p className="text-sm font-semibold text-parsel-gold">{item.priceFormatted}</p>

      <div className="min-w-0 space-y-1">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
            listing.className,
          )}
        >
          {listing.label}
        </span>
        <span
          className={cn(
            "flex w-fit flex-col rounded-full border px-2 py-0.5 text-[10px] font-medium",
            yetki.className,
          )}
        >
          <span>{yetki.detail}</span>
          <span className="text-[9px] opacity-80">{yetki.label}</span>
        </span>
      </div>

      <div className="min-w-0 space-y-1">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
            dealStage.className,
          )}
        >
          {dealStage.label}
        </span>
      </div>

      <p className="min-w-0 text-xs text-muted-foreground">{lastActivity}</p>

      <div ref={menuRef} className="relative flex justify-end">
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
    </li>
  );
}
