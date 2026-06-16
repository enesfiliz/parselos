"use client";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  discardFsboLeadAction,
  listClientsForFsboPromoteAction,
  promoteFsboLeadToClientAction,
} from "@/app/actions/fsbo";
import { FsboDetailPanel } from "@/components/features/fsbo/FsboDetailPanel";
import { FsboEmptyState } from "@/components/features/fsbo/FsboEmptyState";
import { FsboFilterBar } from "@/components/features/fsbo/FsboFilterBar";
import { FsboInboxCard } from "@/components/features/fsbo/FsboInboxCard";
import { FsboSendToDealsDialog } from "@/components/features/fsbo/FsboSendToDealsDialog";
import { FsboTrackEntryPanel } from "@/components/features/fsbo/FsboTrackEntryPanel";
import { appendMockDeal } from "@/lib/deals/deal-persistence";
import { filterFsboLeads } from "@/lib/fsbo/fsbo-media";
import { promoteMockFsboLeadToClient } from "@/lib/fsbo/fsbo-to-deal";
import {
  FSBO_PRODUCT_DISCLAIMER,
  computeFsboTrackMetrics,
} from "@/lib/fsbo/fsbo-tracking";
import {
  EMPTY_FSBO_FILTERS,
  type FsboLeadData,
  type FsboRadarFilters,
} from "@/lib/types/fsbo-lead";

type FsboRadarViewProps = {
  initialLeads: FsboLeadData[];
  fetchError?: string | null;
};

const METRIC_CARD =
  "parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

export function FsboRadarView({
  initialLeads,
  fetchError = null,
}: FsboRadarViewProps) {
  const router = useRouter();
  const [allLeads, setAllLeads] = useState(initialLeads);
  const [draftFilters, setDraftFilters] =
    useState<FsboRadarFilters>(EMPTY_FSBO_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FsboRadarFilters>(EMPTY_FSBO_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialLeads[0]?.id ?? null,
  );
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [sendLead, setSendLead] = useState<FsboLeadData | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    queueMicrotask(() => {
      setAllLeads(initialLeads);
      setSelectedId((current) => {
        if (current && initialLeads.some((lead) => lead.id === current)) {
          return current;
        }
        return initialLeads[0]?.id ?? null;
      });
    });
  }, [initialLeads]);

  const filteredLeads = useMemo(
    () => filterFsboLeads(allLeads, appliedFilters),
    [allLeads, appliedFilters],
  );

  const metrics = useMemo(() => computeFsboTrackMetrics(allLeads), [allLeads]);

  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedId) ??
    allLeads.find((lead) => lead.id === selectedId) ??
    null;

  function animateRemove(id: string, onDone: () => void) {
    setRemovingIds((current) => new Set(current).add(id));
    window.setTimeout(() => {
      onDone();
      setRemovingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setSelectedId((current) => {
        if (current !== id) return current;
        const remaining = filteredLeads.filter((lead) => lead.id !== id);
        return remaining[0]?.id ?? null;
      });
    }, 280);
  }

  function handleApplyFilters() {
    setAppliedFilters(draftFilters);
    toast.message(`${filterFsboLeads(allLeads, draftFilters).length} kayıt listelendi.`);
  }

  function handleDiscard(lead: FsboLeadData) {
    if (lead.id.startsWith("fsbo-mock-")) {
      toast.message("Önizleme kaydı kaldırıldı.");
      return;
    }

    animateRemove(lead.id, () => {
      setAllLeads((current) => current.filter((item) => item.id !== lead.id));
    });

    startTransition(async () => {
      const result = await discardFsboLeadAction(lead.id);

      if (!result.success) {
        setAllLeads((current) => [lead, ...current]);
        toast.error(result.error);
        return;
      }

      router.refresh();
      toast.message("Takip kaydı arşivlendi.");
    });
  }

  function handleOpenSendToDeals(lead: FsboLeadData) {
    setSendLead(lead);
    setSendDialogOpen(true);
  }

  async function handlePromoteToClient(leadId: string, clientId: string) {
    const lead = allLeads.find((item) => item.id === leadId);
    if (!lead) {
      return { success: false, error: "Kayıt bulunamadı." };
    }

    if (leadId.startsWith("fsbo-mock-")) {
      const clientsResult = await listClientsForFsboPromoteAction();
      if (!clientsResult.success) {
        return { success: false, error: clientsResult.error };
      }

      const client = clientsResult.data.find((item) => item.id === clientId);
      if (!client) {
        return { success: false, error: "Müşteri bulunamadı." };
      }

      const result = promoteMockFsboLeadToClient(lead, client);
      appendMockDeal(result.deal);
      return { success: true, clientName: client.adSoyad };
    }

    const result = await promoteFsboLeadToClientAction(leadId, clientId);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, clientName: result.data.clientName };
  }

  function handleSendToDealsSuccess(leadId: string) {
    const lead = allLeads.find((item) => item.id === leadId);
    if (!lead) return;

    animateRemove(leadId, () => {
      setAllLeads((current) => current.filter((item) => item.id !== leadId));
    });

    if (!leadId.startsWith("fsbo-mock-")) {
      startTransition(() => {
        router.refresh();
      });
    }
  }

  return (
    <div className="min-h-full bg-parsel-canvas">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <p className="parsel-section-label text-primary">Fırsat operasyonu</p>
            <h1 className="parsel-page-title text-foreground">Fırsat Takip Merkezi</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Sahibinden ve diğer kaynaklardaki ilanları manuel olarak takip edin.
              Link arşivlenir; başlık, fiyat ve notları siz girersiniz. Otomatik veri
              çekme bu modülde kullanılmaz.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-parsel-elevated px-4 py-3 text-sm text-foreground/85">
            {FSBO_PRODUCT_DISCLAIMER}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className={METRIC_CARD}>
            <p className="text-[11px] text-muted-foreground">Toplam kayıt</p>
            <p className="parsel-metric-value mt-2 text-foreground">{metrics.total}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] text-muted-foreground">Aktif takip</p>
            <p className="parsel-metric-value mt-2 text-primary">{metrics.active}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] text-muted-foreground">Yüksek öncelik</p>
            <p className="parsel-metric-value mt-2 text-parsel-gold">{metrics.highPriority}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] text-muted-foreground">Takip zamanı gelen</p>
            <p className="parsel-metric-value mt-2 text-foreground">{metrics.followUpDue}</p>
          </article>
        </section>

        <FsboTrackEntryPanel
          onCreated={(leads) => {
            setAllLeads(leads);
            setSelectedId(leads[0]?.id ?? null);
            router.refresh();
          }}
        />

        {fetchError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Kayıtlar yüklenemedi. Sayfayı yenileyin veya yeni takip kaydı ekleyin.
          </div>
        ) : null}

        <FsboFilterBar
          draft={draftFilters}
          onDraftChange={setDraftFilters}
          onApply={handleApplyFilters}
          isRunning={isPending}
        />

        <section className="grid min-h-0 grid-cols-1 gap-4 lg:min-h-[600px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-parsel-panel shadow-parsel-sm">
            <div className="border-b border-border/50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Takip listesi
              </p>
              <p className="text-sm text-muted-foreground">
                {filteredLeads.length} kayıt
              </p>
            </div>

            <ul className="max-h-[560px] overflow-y-auto p-2">
              {filteredLeads.length === 0 ? (
                <li>
                  <FsboEmptyState
                    variant={allLeads.length === 0 ? "empty" : "filtered"}
                  />
                </li>
              ) : (
                filteredLeads.map((lead) => (
                  <FsboInboxCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedId === lead.id}
                    isRemoving={removingIds.has(lead.id)}
                    onSelect={() => setSelectedId(lead.id)}
                    onSendToDeals={handleOpenSendToDeals}
                  />
                ))
              )}
            </ul>
          </div>

          <FsboDetailPanel
            lead={selectedLead}
            onDiscard={handleDiscard}
            onSendToDeals={handleOpenSendToDeals}
          />
        </section>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Bookmark className="size-3.5" />
          <span>Manuel takip kayıtları yalnızca sizin hesabınıza bağlıdır.</span>
          <span className="text-border">·</span>
          <Link href="/deals" className="text-primary hover:underline">
            Fırsatlar kanbanı
          </Link>
          <span className="text-border">·</span>
          <Link href="/portfolios" className="text-primary hover:underline">
            Portföy vitrini
          </Link>
        </div>
      </div>

      <FsboSendToDealsDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        lead={sendLead}
        onPromote={handlePromoteToClient}
        onSuccess={handleSendToDealsSuccess}
      />
    </div>
  );
}
