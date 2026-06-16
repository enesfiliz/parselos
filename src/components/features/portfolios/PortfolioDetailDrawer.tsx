"use client";

import { useEffect } from "react";
import { Pencil, Trash2, X } from "lucide-react";

import { PortfolioDetailContent } from "@/components/features/portfolios/PortfolioDetailContent";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { Button } from "@/components/ui/button";
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
          "parsel-surface fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border/60 bg-parsel-panel shadow-[-24px_0_80px_rgba(0,0,0,0.2)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Detayı kapat"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PortfolioDetailContent
            portfolio={portfolio}
            variant="drawer"
            className="min-h-0 flex-1"
          />
        </div>

        <div className="shrink-0 border-t border-border/50 px-6 py-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10"
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
              className="h-10 border-destructive/20 text-destructive hover:bg-destructive/10"
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
