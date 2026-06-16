"use client";

import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  deletePortfolioAction,
  updatePortfolioAction,
} from "@/app/actions/portfolios";
import { PortfolioAddDrawer } from "@/components/features/portfolios/PortfolioAddDrawer";
import { PortfolioDeleteDialog } from "@/components/features/portfolios/PortfolioDeleteDialog";
import { PortfolioDetailContent } from "@/components/features/portfolios/PortfolioDetailContent";
import { isMockPortfolio } from "@/components/features/portfolios/portfolio-ui-helpers";
import { Button } from "@/components/ui/button";
import type { PortfolioFormValues } from "@/lib/portfolios/portfolio-form";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";

type PortfolioDetailViewProps = {
  initialPortfolio: AuthorizedPortfolioItem;
};

export function PortfolioDetailView({ initialPortfolio }: PortfolioDetailViewProps) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handlePortfolioSubmit(values: PortfolioFormValues) {
    setIsSaving(true);
    try {
      const result = await updatePortfolioAction(portfolio.id, values);
      if (!result.success) {
        toast.error("Güncelleme başarısız", { description: result.error });
        return;
      }

      setPortfolio(result.data);
      setFormOpen(false);
      toast.success("Portföy güncellendi", {
        description: `${result.data.title} kaydı yenilendi.`,
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deletePortfolioAction(portfolio.id);
      if (!result.success) {
        toast.error("Silme başarısız", { description: result.error });
        return;
      }

      toast.success("Portföy kaldırıldı", {
        description: `${portfolio.title} veritabanından silindi.`,
      });
      router.push("/portfolios");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-parsel-canvas">
      <div className="mx-auto w-full max-w-4xl">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 bg-parsel-canvas/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <Link
            href="/portfolios"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Portföyler
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setFormOpen(true)}
              disabled={isSaving || isMockPortfolio(portfolio.id)}
            >
              <Pencil className="size-3.5" strokeWidth={1.75} />
              Düzenle
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-destructive/20 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting || isMockPortfolio(portfolio.id)}
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} />
              Kaldır
            </Button>
          </div>
        </div>

        <PortfolioDetailContent portfolio={portfolio} variant="page" />

        <PortfolioAddDrawer
          open={formOpen}
          mode="edit"
          portfolio={portfolio}
          isSubmitting={isSaving}
          onOpenChange={setFormOpen}
          onSubmit={handlePortfolioSubmit}
        />

        <PortfolioDeleteDialog
          open={deleteOpen}
          portfolio={portfolio}
          isDeleting={isDeleting}
          onCancel={() => {
            if (isDeleting) return;
            setDeleteOpen(false);
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
    </div>
  );
}
