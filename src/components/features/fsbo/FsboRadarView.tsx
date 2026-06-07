"use client";

import { Radar } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { appendMockDeal } from "@/lib/deals/deal-persistence";
import { filterFsboLeads } from "@/lib/fsbo/fsbo-media";
import { promoteMockFsboLeadToClient } from "@/lib/fsbo/fsbo-to-deal";
import {
  EMPTY_FSBO_FILTERS,
  type FsboLeadData,
  type FsboRadarFilters,
  type FsboWatchRegionData,
} from "@/lib/types/fsbo-lead";

type FsboRadarViewProps = {
  initialLeads: FsboLeadData[];
  initialRegions: FsboWatchRegionData[];
  useMock?: boolean;
  dbLeadCount?: number;
  fetchError?: string | null;
};

export function FsboRadarView({
  initialLeads,
  useMock = false,
  dbLeadCount = 0,
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
  const [isScanning, setIsScanning] = useState(false);
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

  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedId) ??
    allLeads.find((lead) => lead.id === selectedId) ??
    null;

  const showListeningBanner = useMock && dbLeadCount === 0;

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

  function handleRunRadar() {
    setAppliedFilters(draftFilters);
    setIsScanning(true);

    startTransition(() => {
      router.refresh();
      window.setTimeout(() => {
        const count = filterFsboLeads(allLeads, draftFilters).length;
        setIsScanning(false);
        toast.success(`${count} sinyal listelendi.`);
      }, 350);
    });
  }

  function handleDiscard(lead: FsboLeadData) {
    animateRemove(lead.id, () => {
      setAllLeads((current) => current.filter((item) => item.id !== lead.id));
    });

    if (useMock || lead.id.startsWith("fsbo-mock-")) {
      toast.message("Önizleme: İlan çöpe atıldı.");
      return;
    }

    startTransition(async () => {
      const result = await discardFsboLeadAction(lead.id);

      if (!result.success) {
        setAllLeads((current) => [lead, ...current]);
        toast.error(result.error);
        return;
      }

      router.refresh();
      toast.message("İlan çöpe atıldı.");
    });
  }

  function handleOpenSendToDeals(lead: FsboLeadData) {
    setSendLead(lead);
    setSendDialogOpen(true);
  }

  async function handlePromoteToClient(leadId: string, clientId: string) {
    const lead = allLeads.find((item) => item.id === leadId);
    if (!lead) {
      return { success: false, error: "İlan bulunamadı." };
    }

    if (useMock || leadId.startsWith("fsbo-mock-")) {
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

    if (!useMock && !leadId.startsWith("fsbo-mock-")) {
      startTransition(() => {
        router.refresh();
      });
    }
  }

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header>
          <div className="mb-2 flex items-center gap-2 text-parsel-gold">
            <Radar className="size-4" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
              FSBO Komuta Merkezi
            </span>
          </div>
          <h1 className="font-outfit text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            İstihbarat Radarı — Medya Odaklı Inbox
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Veritabanından gelen canlı FSBO ilanları; kapak fotoğrafı, kaynak
            rozeti ve fiyatlarla gelen kutusunda listelenir.
          </p>
        </header>

        {fetchError ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Veritabanı uyarısı: {fetchError}. Önizleme modu aktif.
          </div>
        ) : null}

        {showListeningBanner ? (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-parsel-panel">
            <FsboEmptyState variant="listening" />
          </div>
        ) : null}

        <FsboFilterBar
          draft={draftFilters}
          onDraftChange={setDraftFilters}
          onRun={handleRunRadar}
          isRunning={isScanning || isPending}
        />

        {useMock ? (
          <p className="text-[11px] text-muted-foreground">
            Önizleme modu: {allLeads.length} mock kart yüklü (veritabanında{" "}
            {dbLeadCount} kayıt).
          </p>
        ) : null}

        <section className="grid min-h-0 grid-cols-1 gap-4 lg:min-h-[600px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border/50 bg-parsel-panel">
            <div className="border-b border-border/50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Gelen Kutusu
              </p>
              <p className="text-sm text-muted-foreground">
                {filteredLeads.length} aktif sinyal
                {useMock ? " (önizleme)" : ""}
              </p>
            </div>

            <ul className="max-h-[560px] overflow-y-auto p-2">
              {filteredLeads.length === 0 ? (
                <li>
                  <FsboEmptyState
                    variant={allLeads.length === 0 ? "listening" : "filtered"}
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
