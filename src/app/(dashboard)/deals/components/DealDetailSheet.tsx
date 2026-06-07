"use client";

import { useEffect, useRef, useState } from "react";

import { ClientCombobox } from "@/app/(dashboard)/deals/components/ClientCombobox";
import { DealTasksPanel } from "@/app/(dashboard)/deals/components/DealTasksPanel";
import { ExternalListingSection } from "@/app/(dashboard)/deals/components/ExternalListingSection";
import {
  InlineEditField,
  InlineEditSelect,
} from "@/app/(dashboard)/deals/components/InlineEditField";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DEAL_STAGES,
  DEFAULT_DEAL_TASKS,
  formatFullTRY,
  type DealCardData,
  type DealStageId,
} from "@/lib/types/deal";
import type { ScrapeResult } from "@/lib/types/scrape";

type DealDetailSheetProps = {
  deal: DealCardData | null;
  open: boolean;
  useMock?: boolean;
  onOpenChange: (open: boolean) => void;
  onDealChange: (deal: DealCardData) => void;
};

function patchDeal(
  deal: DealCardData,
  patch: Partial<DealCardData>,
): DealCardData {
  return {
    ...deal,
    ...patch,
    guncellenmeTarihi: new Date().toISOString(),
  };
}

function parseBudgetTL(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isNaN(parsed) ? null : parsed;
}

function resolveLocation(deal: DealCardData) {
  if (deal.client.mulkTipi) return deal.client.mulkTipi;
  if (deal.listingIntel?.location) return deal.listingIntel.location;
  return [deal.property.mahalle, deal.property.ilce, deal.property.il]
    .filter(Boolean)
    .join(", ");
}

function parseLocationParts(value: string) {
  const parts = value
    .split(/[,/]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { mahalle: parts[0], ilce: parts[1], il: parts[2] ?? parts[1] };
  }

  return { mahalle: null, ilce: parts[0] ?? null, il: parts[0] ?? null };
}

export function DealDetailSheet({
  deal,
  open,
  useMock = false,
  onOpenChange,
  onDealChange,
}: DealDetailSheetProps) {
  const [localDeal, setLocalDeal] = useState<DealCardData | null>(deal);
  const onDealChangeRef = useRef(onDealChange);

  useEffect(() => {
    onDealChangeRef.current = onDealChange;
  }, [onDealChange]);

  useEffect(() => {
    queueMicrotask(() => setLocalDeal(deal));
  }, [deal]);

  function syncDealToParent(next: DealCardData) {
    queueMicrotask(() => {
      onDealChangeRef.current(next);
    });
  }

  function update(partial: Partial<DealCardData>) {
    setLocalDeal((current) => {
      if (!current) return current;
      const next = patchDeal(current, partial);
      syncDealToParent(next);
      return next;
    });
  }

  if (!localDeal) return null;

  function handleScrapeSuccess(data: ScrapeResult) {
    setLocalDeal((current) => {
      if (!current) return current;

      const budgetTL = parseBudgetTL(data.price);
      const systemNote = `Sistem Notu: İlan verileri çekildi - ${data.title}`;
      const existingNotlar = current.notlar?.trim();
      const notlar = existingNotlar
        ? `${existingNotlar}\n\n${systemNote}`
        : systemNote;

      const m2Numeric =
        data.m2 && data.m2 !== "—"
          ? Number(data.m2.replace(/[^\d]/g, ""))
          : null;

      const next = patchDeal(current, {
        budgetTL,
        notlar,
        listingUrl: data.url,
        client: {
          ...current.client,
          butce: data.price,
        },
        listingIntel: {
          fiyat: data.price,
          ilanTarihi: new Intl.DateTimeFormat("tr-TR", {
            dateStyle: "medium",
          }).format(new Date()),
          metrekare:
            data.m2 && data.m2 !== "—" ? `${data.m2} m²` : "—",
          source: data.source,
          title: data.title,
          location: data.location,
        },
        property: {
          ...current.property,
          ilanBasligi: data.title,
          fiyat: budgetTL ? String(budgetTL) : current.property.fiyat,
          metrekare: m2Numeric ?? current.property.metrekare,
        },
      });

      syncDealToParent(next);
      return next;
    });
  }

  const budgetDisplay =
    localDeal.budgetTL && localDeal.budgetTL > 0
      ? formatFullTRY(localDeal.budgetTL)
      : (localDeal.client.butce ?? "");

  const stageOptions = DEAL_STAGES.map((stage) => ({
    value: stage.id,
    label: stage.label,
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton
        className="!left-auto !right-0 w-full overflow-y-auto border-l border-border bg-background p-0 data-open:slide-in-from-right data-closed:slide-out-to-right sm:max-w-none sm:w-[500px]"
      >
        <header className="border-b border-border px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-parsel-gold">
            Enterprise Komuta Merkezi
          </p>
          <h2 className="mt-2 font-outfit text-xl font-semibold tracking-tight text-foreground">
            {localDeal.client.adSoyad.startsWith("FSBO —")
              ? localDeal.property.ilanBasligi
              : localDeal.client.adSoyad}
          </h2>
          <p className="mt-1 text-sm text-foreground0">
            {resolveLocation(localDeal)}
          </p>
        </header>

        <div className="space-y-6 px-6 py-6">
          <ClientCombobox
            client={localDeal.client}
            useMock={useMock}
            onSelect={(client) => update({ client })}
          />

          <section className="rounded-xl border border-border/50 bg-parsel-panel p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground0">
              İlişkisel Düzenleme
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <InlineEditField
                label="Bütçe"
                value={budgetDisplay}
                accent
                onSave={(value) => {
                  const budgetTL = parseBudgetTL(value);
                  update({
                    budgetTL,
                    client: {
                      ...localDeal.client,
                      butce: value,
                    },
                  });
                }}
              />
              <InlineEditField
                label="Lokasyon"
                value={resolveLocation(localDeal)}
                onSave={(value) => {
                  const parts = parseLocationParts(value);
                  update({
                    client: {
                      ...localDeal.client,
                      mulkTipi: value,
                    },
                    property: {
                      ...localDeal.property,
                      mahalle: parts.mahalle,
                      ilce: parts.ilce ?? localDeal.property.ilce,
                      il: parts.il ?? localDeal.property.il,
                    },
                    listingIntel: localDeal.listingIntel
                      ? { ...localDeal.listingIntel, location: value }
                      : undefined,
                  });
                }}
              />
              <InlineEditSelect
                label="Aşama"
                value={localDeal.stage}
                options={stageOptions}
                accent
                onSave={(stage) =>
                  update({ stage: stage as DealStageId })
                }
              />
              <InlineEditField
                label="Son Görüşme"
                value={localDeal.sonIletisim ?? ""}
                placeholder="Bugün"
                onSave={(sonIletisim) =>
                  update({ sonIletisim: sonIletisim || null })
                }
              />
            </div>
          </section>

          <section className="rounded-xl border border-border/50 bg-parsel-panel p-4">
            <ExternalListingSection
              listingUrl={localDeal.listingUrl}
              listingIntel={localDeal.listingIntel}
              onUrlChange={(listingUrl) => update({ listingUrl })}
              onIntelChange={(listingIntel) => update({ listingIntel })}
              onScrapeSuccess={handleScrapeSuccess}
            />
          </section>

          <section className="rounded-xl border border-border/50 bg-parsel-panel p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground0">
              Yapılacak İşler
            </p>
            <DealTasksPanel
              tasks={localDeal.tasks ?? DEFAULT_DEAL_TASKS}
              notlar={localDeal.notlar}
              onTasksChange={(tasks) => update({ tasks })}
              onNotlarChange={(notlar) => update({ notlar: notlar || null })}
            />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
