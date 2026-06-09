"use client";

import { AlertTriangle, Briefcase, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SAHIBINDEN_POLICY } from "@/lib/compliance/data-source-policy";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";

type FsboImportPanelProps = {
  onImported: (leads: FsboLeadData[]) => void;
};

type ImportResult = {
  url: string;
  success: boolean;
  error?: string;
  portfolioId?: string;
};

type ManualFields = {
  title: string;
  price: string;
  location: string;
  m2: string;
  imageUrl: string;
};

const emptyManual: ManualFields = {
  title: "",
  price: "",
  location: "",
  m2: "",
  imageUrl: "",
};

export function FsboImportPanel({ onImported }: FsboImportPanelProps) {
  const [urlsText, setUrlsText] = useState("");
  const [manual, setManual] = useState<ManualFields>(emptyManual);
  const [showManual, setShowManual] = useState(false);
  const [addToPortfolio, setAddToPortfolio] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastResults, setLastResults] = useState<ImportResult[] | null>(null);

  async function handleImport() {
    const urls = urlsText
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      toast.error("En az bir ilan linki girin.");
      return;
    }

    const manualPayload =
      showManual && (manual.title || manual.price || manual.imageUrl)
        ? {
            title: manual.title.trim() || undefined,
            price: manual.price.trim() || undefined,
            location: manual.location.trim() || undefined,
            m2: manual.m2.trim() || undefined,
            imageUrl: manual.imageUrl.trim() || undefined,
          }
        : undefined;

    if (showManual && manualPayload && !manualPayload.price) {
      toast.error("Otomatik çekim başarısızsa manuel fiyat zorunludur.");
      return;
    }

    setIsImporting(true);
    setLastResults(null);

    try {
      const items = urls.map((url) => ({
        url,
        ...manualPayload,
      }));

      const response = await fetch("/api/fsbo-leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, addToPortfolio }),
      });

      const data = (await response.json()) as {
        imported?: number;
        failed?: number;
        results?: ImportResult[];
        leads?: FsboLeadData[];
        error?: string;
      };

      if (!response.ok) {
        toast.error(data.error ?? "İçe aktarma başarısız.");
        if (data.error?.includes("okunamadı") || data.error?.includes("engellendi")) {
          setShowManual(true);
        }
        return;
      }

      setLastResults(data.results ?? []);
      if (data.leads) {
        onImported(data.leads);
      }

      const imported = data.imported ?? 0;
      const failed = data.failed ?? 0;
      const portfolioCount =
        data.results?.filter((r) => r.success && r.portfolioId).length ?? 0;

      if (imported > 0 && failed === 0) {
        toast.success(
          portfolioCount > 0
            ? `${imported} ilan + ${portfolioCount} portföy kaydı oluşturuldu.`
            : `${imported} ilan içe aktarıldı.`,
        );
        setUrlsText("");
        setManual(emptyManual);
        setShowManual(false);
      } else if (imported > 0) {
        toast.message(`${imported} başarılı, ${failed} başarısız.`);
        setShowManual(true);
      } else {
        toast.error(
          "Otomatik çekim başarısız. Manuel alanları doldurup tekrar deneyin.",
        );
        setShowManual(true);
      }
    } catch {
      toast.error("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-md">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-parsel-gold">
            <Link2 className="size-4" strokeWidth={2} />
            <span className="parsel-section-label">İlan Linki Ekle</span>
          </div>
          <h2 className="text-lg font-bold text-foreground">Link ile içe aktar</h2>
          <p className="mt-1 max-w-xl text-sm font-medium text-muted-foreground">
            Otomatik okuma başlık, fiyat ve kapak görseli dener (og:image + galeri).
            Başarısızsa manuel alanları doldurun.
          </p>
        </div>
        <Button onClick={handleImport} disabled={isImporting} className="shrink-0">
          {isImporting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Aktarılıyor…
            </>
          ) : (
            "İçe Aktar"
          )}
        </Button>
      </div>

      <Textarea
        value={urlsText}
        onChange={(event) => setUrlsText(event.target.value)}
        placeholder={
          "https://www.sahibinden.com/ilan/...\nhttps://www.emlakjet.com/..."
        }
        rows={3}
        className="resize-y font-mono text-sm"
        disabled={isImporting}
      />

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={addToPortfolio}
          onChange={(e) => setAddToPortfolio(e.target.checked)}
          className="size-4 rounded border-border accent-primary"
        />
        <Briefcase className="size-4 text-parsel-gold" />
        Portföylere de ekle (yetkili portföy + fırsat kartı)
      </label>

      <button
        type="button"
        onClick={() => setShowManual((v) => !v)}
        className="mt-3 text-xs font-semibold text-parsel-gold hover:underline"
      >
        {showManual ? "Manuel alanları gizle" : "Otomatik çekim başarısızsa manuel bilgi gir →"}
      </button>

      {showManual ? (
        <div className="mt-3 grid gap-3 rounded-xl border border-border/50 bg-parsel-sunken/40 p-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="manual-title">Başlık</Label>
            <Input
              id="manual-title"
              value={manual.title}
              onChange={(e) => setManual((m) => ({ ...m, title: e.target.value }))}
              placeholder="3+1 Deniz Manzaralı Daire"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-price">Fiyat (TL)</Label>
            <Input
              id="manual-price"
              value={manual.price}
              onChange={(e) => setManual((m) => ({ ...m, price: e.target.value }))}
              placeholder="4.250.000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-m2">m²</Label>
            <Input
              id="manual-m2"
              value={manual.m2}
              onChange={(e) => setManual((m) => ({ ...m, m2: e.target.value }))}
              placeholder="120"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="manual-location">Konum</Label>
            <Input
              id="manual-location"
              value={manual.location}
              onChange={(e) => setManual((m) => ({ ...m, location: e.target.value }))}
              placeholder="Gölcük, Kocaeli"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="manual-image">Kapak görseli URL (isteğe bağlı)</Label>
            <Input
              id="manual-image"
              value={manual.imageUrl}
              onChange={(e) => setManual((m) => ({ ...m, imageUrl: e.target.value }))}
              placeholder="https://... (ilan sayfasında görsele sağ tık → bağlantıyı kopyala)"
            />
          </div>
        </div>
      ) : null}

      <details className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-amber-200/90">
          <AlertTriangle className="size-4 shrink-0 text-amber-400" />
          {SAHIBINDEN_POLICY.title}
        </summary>
        <p className="mt-2 text-xs text-muted-foreground">{SAHIBINDEN_POLICY.summary}</p>
      </details>

      {lastResults && lastResults.length > 0 ? (
        <ul className="mt-4 space-y-1.5 rounded-lg border border-border/50 bg-parsel-sunken/50 p-3 text-xs">
          {lastResults.map((result) => (
            <li
              key={result.url}
              className={
                result.success
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-300"
              }
            >
              {result.success ? "✓" : "✗"} {result.url.slice(0, 64)}
              {result.error ? ` — ${result.error}` : ""}
              {result.portfolioId ? " · portföye eklendi" : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
