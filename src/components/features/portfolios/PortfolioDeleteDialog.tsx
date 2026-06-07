"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { cn } from "@/lib/utils";

type PortfolioDeleteDialogProps = {
  open: boolean;
  portfolio: AuthorizedPortfolioItem | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function PortfolioDeleteDialog({
  open,
  portfolio,
  isDeleting = false,
  onCancel,
  onConfirm,
}: PortfolioDeleteDialogProps) {
  if (!open || !portfolio) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        role="presentation"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-labelledby="delete-portfolio-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-parsel-elevated p-6 shadow-2xl"
      >
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="size-5 text-red-400" strokeWidth={1.75} />
        </div>
        <h3
          id="delete-portfolio-title"
          className="text-lg font-medium tracking-tight text-foreground/90"
        >
          Portföyü kaldır
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/70">{portfolio.title}</span>{" "}
          vitrinden silinecek. Bu işlem geri alınamaz.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={isDeleting}
            className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground/90"
            onClick={onCancel}
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            className={cn("bg-red-600 text-foreground hover:bg-red-500 disabled:opacity-60")}
            onClick={onConfirm}
          >
            {isDeleting ? "Kaldırılıyor..." : "Evet, Kaldır"}
          </Button>
        </div>
      </div>
    </div>
  );
}
