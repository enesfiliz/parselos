"use client";

import {
  Calendar,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Ruler,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ListingIntel } from "@/lib/types/deal";
import type { ScrapeResult } from "@/lib/types/scrape";

type ExternalListingSectionProps = {
  listingUrl: string | null | undefined;
  listingIntel: ListingIntel | null | undefined;
  onUrlChange: (url: string) => void;
  onIntelChange: (intel: ListingIntel | null) => void;
  onScrapeSuccess: (data: ScrapeResult) => void;
};

function toListingIntel(data: ScrapeResult): ListingIntel {
  return {
    fiyat: data.price,
    ilanTarihi: new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
    }).format(new Date()),
    metrekare: data.m2 && data.m2 !== "—" ? `${data.m2} m²` : "—",
    source: data.source,
    title: data.title,
    location: data.location,
  };
}

export function ExternalListingSection({
  listingUrl,
  listingIntel,
  onUrlChange,
  onIntelChange,
  onScrapeSuccess,
}: ExternalListingSectionProps) {
  const [url, setUrl] = useState(listingUrl ?? "");
  const [fetching, setFetching] = useState(false);

  async function handleFetch() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setFetching(true);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const json = (await response.json()) as ScrapeResult & { error?: string };

      if (!response.ok) {
        toast.error(json.error ?? "Veriler çekilemedi, linki kontrol edin.");
        return;
      }

      onUrlChange(trimmed);
      onIntelChange(toListingIntel(json));
      onScrapeSuccess(json);
    } catch {
      toast.error("Veriler çekilemedi, linki kontrol edin.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ExternalLink className="size-4 text-[#b38c56]" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Dış Bağlantılar & İstihbarat
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !fetching && handleFetch()}
          placeholder="İlan linkini yapıştır..."
          disabled={fetching}
          className="h-9 flex-1 border-white/10 bg-[#0f1417] text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={fetching || !url.trim()}
          onClick={handleFetch}
          className="shrink-0 border-[#b38c56]/30 text-[#b38c56] hover:bg-[#b38c56]/10"
        >
          {fetching ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Çekiliyor...
            </>
          ) : (
            <>
              <Download className="size-4" />
              Verileri Çek
            </>
          )}
        </Button>
      </div>

      {listingIntel ? (
        <div className="rounded-lg bg-[#151f23] p-3">
          {listingIntel.source ? (
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b38c56]">
              {listingIntel.source}
            </p>
          ) : null}
          {listingIntel.title ? (
            <p className="mb-3 text-sm font-medium leading-snug text-zinc-200">
              {listingIntel.title}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <IntelItem icon={Tag} label="Fiyat" value={listingIntel.fiyat} />
            <IntelItem
              icon={Calendar}
              label="İlan Tarihi"
              value={listingIntel.ilanTarihi}
            />
            <IntelItem
              icon={Ruler}
              label="m²"
              value={listingIntel.metrekare}
            />
            <IntelItem
              icon={MapPin}
              label="Konum"
              value={listingIntel.location ?? "Belirtilmedi"}
            />
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-white/[0.06] bg-[#151f23]/50 px-3 py-4 text-center text-xs text-zinc-600">
          Sahibinden, Emlakjet veya Hepsiemlak linki yapıştırıp verileri çekin.
        </p>
      )}
    </section>
  );
}

function IntelItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-zinc-600">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="text-sm font-medium text-zinc-300">{value}</p>
    </div>
  );
}
