"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createPortfolioAction,
  deletePortfolioAction,
  updatePortfolioAction,
} from "@/app/actions/portfolios";
import { PortfolioAddDrawer } from "@/components/features/portfolios/PortfolioAddDrawer";
import { PortfolioCard } from "@/components/features/portfolios/PortfolioCard";
import { PortfolioDeleteDialog } from "@/components/features/portfolios/PortfolioDeleteDialog";
import { PortfolioDetailDrawer } from "@/components/features/portfolios/PortfolioDetailDrawer";
import type { PortfolioFormValues } from "@/lib/portfolios/portfolio-form";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";

type ListingFilter = "ALL" | "SATILIK" | "KIRALIK";

type PortfoliosViewProps = {
  portfolios: AuthorizedPortfolioItem[];
  openSheetOnMount?: boolean;
};

const FILTER_OPTIONS: { value: ListingFilter; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "SATILIK", label: "Satılık" },
  { value: "KIRALIK", label: "Kiralık" },
];

const GRID_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" as const },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

function PortfolioEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-parsel-admin px-6 py-16 text-center"
    >
      <span className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-white/[0.02]">
        <Briefcase className="size-6 text-parsel-gold/70" strokeWidth={1.5} />
      </span>
      <h2 className="font-inter text-lg font-medium tracking-tight text-foreground/90">
        Burada henüz bir portföy yok
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/45">
        İlk portföyünü ekleyerek işe başla. Yetkili mülklerini tek vitrinde
        yönet, performansını anlık takip et.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-parsel-gold px-6 text-sm font-medium text-black transition-colors hover:bg-[#c49a62]"
      >
        <Plus className="size-4" strokeWidth={2} />
        İlk Portföyünü Ekle
      </button>
    </motion.div>
  );
}

export function PortfoliosView({
  portfolios,
  openSheetOnMount = false,
}: PortfoliosViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<ListingFilter>("ALL");
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

  const openDetails = useCallback((portfolio: AuthorizedPortfolioItem) => {
    setDetailPortfolio(portfolio);
    setDetailOpen(true);
  }, []);

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

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((item) => item.listingType === filter);
  }, [filter, items]);

  async function handlePortfolioSubmit(values: PortfolioFormValues) {
    setIsSaving(true);
    try {
      if (formMode === "edit" && activePortfolio) {
        const isMock = activePortfolio.id.startsWith("portfolio-mock-");
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
      const isMock = deletePortfolio.id.startsWith("portfolio-mock-");
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

  const activeCount = items.length;
  const isTrulyEmpty = items.length === 0;
  const isFilterEmpty = !isTrulyEmpty && filtered.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="mb-6 flex flex-col gap-4 border-b border-border/50 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-parsel-gold/70">
            Portföy Vitrini
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-outfit text-2xl font-semibold tracking-tight text-foreground/90 md:text-3xl">
              Yetkili Portföylerim
            </h1>
            <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-0.5 text-xs tabular-nums text-muted-foreground">
              {activeCount} aktif
            </span>
          </div>
        </div>

        {!isTrulyEmpty ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as ListingFilter)}
              className="h-10 w-full rounded-lg border border-border bg-transparent px-3 text-xs text-foreground/70 transition-colors focus:border-[#b38c56] focus:outline-none focus:ring-1 focus:ring-[#b38c56]/30 sm:w-auto"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-parsel-elevated">
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={openCreateSheet}
              disabled={isSaving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-parsel-gold px-4 text-sm font-medium text-black transition-colors hover:bg-[#c49a62] disabled:opacity-60 sm:w-auto"
            >
              <Plus className="size-4" strokeWidth={2} />
              Portföy Ekle
            </button>
          </div>
        ) : null}
      </header>

      {isTrulyEmpty ? (
        <PortfolioEmptyState onAdd={openCreateSheet} />
      ) : isFilterEmpty ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Bu filtreye uygun yetkili portföy bulunamadı.
          </p>
        </div>
      ) : (
        <motion.div
          variants={GRID_VARIANTS}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={CARD_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
                layout
              >
                <PortfolioCard
                  item={item}
                  onDetails={openDetails}
                  onEdit={openEditSheet}
                  onDelete={openDeleteDialog}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

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
        <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-full border border-border bg-parsel-elevated/95 px-4 py-2 text-xs text-foreground/70 shadow-xl">
          <Loader2 className="size-3.5 animate-spin" />
          {isDeleting ? "Siliniyor..." : "Kaydediliyor..."}
        </div>
      ) : null}
    </div>
  );
}
