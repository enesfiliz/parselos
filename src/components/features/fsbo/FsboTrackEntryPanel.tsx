"use client";

import { BookmarkPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FSBO_PRODUCT_DISCLAIMER,
  isPublicSourceUrl,
} from "@/lib/fsbo/fsbo-tracking";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";

type FsboTrackEntryPanelProps = {
  onCreated: (leads: FsboLeadData[]) => void;
};

export function FsboTrackEntryPanel({ onCreated }: FsboTrackEntryPanelProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [metrekare, setMetrekare] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [trackingStatus, setTrackingStatus] = useState<
    "watching" | "contacted" | "follow_up" | "negotiating" | "closed"
  >("watching");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (sourceUrl.trim() && !isPublicSourceUrl(sourceUrl)) {
      toast.error("Kaynak linki geçerli bir http/https URL olmalıdır.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/fsbo-leads/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          location,
          price,
          notes,
          sourceUrl: sourceUrl.trim() || undefined,
          priority,
          trackingStatus,
          nextFollowUpAt: nextFollowUpAt || undefined,
          metrekare: metrekare || undefined,
        }),
      });

      const data = (await response.json()) as {
        leads?: FsboLeadData[];
        error?: string;
      };

      if (!response.ok) {
        toast.error(data.error ?? "Kayıt oluşturulamadı.");
        return;
      }

      if (data.leads) {
        onCreated(data.leads);
      }

      toast.success("Fırsat takip kaydı eklendi.");
      setTitle("");
      setLocation("");
      setPrice("");
      setMetrekare("");
      setSourceUrl("");
      setNotes("");
      setNextFollowUpAt("");
      setPriority("medium");
      setTrackingStatus("watching");
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm">
      <div className="mb-4 space-y-2">
        <p className="parsel-section-label text-primary">Manuel fırsat takibi</p>
        <h2 className="text-lg font-semibold text-foreground">Yeni takip kaydı ekle</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {FSBO_PRODUCT_DISCLAIMER}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="fsbo-title">Başlık</Label>
          <Input
            id="fsbo-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="3+1 Deniz manzaralı daire"
            required
            minLength={4}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fsbo-location">Konum</Label>
          <Input
            id="fsbo-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Gölcük, Kocaeli"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fsbo-price">Fiyat (TL)</Label>
          <Input
            id="fsbo-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="4.250.000"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fsbo-m2">m² (opsiyonel)</Label>
          <Input
            id="fsbo-m2"
            value={metrekare}
            onChange={(event) => setMetrekare(event.target.value)}
            placeholder="120"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fsbo-source">Kaynak linki (opsiyonel)</Label>
          <Input
            id="fsbo-source"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fsbo-priority">Öncelik</Label>
          <select
            id="fsbo-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as typeof priority)
            }
            className="h-10 w-full rounded-lg border border-border/60 bg-parsel-elevated px-3 text-sm"
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fsbo-status">Takip durumu</Label>
          <select
            id="fsbo-status"
            value={trackingStatus}
            onChange={(event) =>
              setTrackingStatus(event.target.value as typeof trackingStatus)
            }
            className="h-10 w-full rounded-lg border border-border/60 bg-parsel-elevated px-3 text-sm"
          >
            <option value="watching">İzleniyor</option>
            <option value="contacted">İletişim kuruldu</option>
            <option value="follow_up">Takip bekliyor</option>
            <option value="negotiating">Görüşmede</option>
            <option value="closed">Kapatıldı</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fsbo-followup">Sonraki takip tarihi</Label>
          <Input
            id="fsbo-followup"
            type="date"
            value={nextFollowUpAt}
            onChange={(event) => setNextFollowUpAt(event.target.value)}
          />
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="fsbo-notes">Not / özet</Label>
          <Textarea
            id="fsbo-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Mal sahibi iletişim notu, fiyat geçmişi, görüşme özeti..."
          />
        </div>

        <div className="lg:col-span-2">
          <Button type="submit" disabled={isSaving} className="h-11 w-full sm:w-auto">
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BookmarkPlus className="size-4" />
            )}
            Takip kaydı oluştur
          </Button>
        </div>
      </form>
    </section>
  );
}
