"use client";

import { Activity, MapPin, Radar } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RadarAnnouncement {
  id: string;
  title: string;
  summary: string;
  region: string;
  source: string;
  publishedAt: string;
  matchedKeywords: string[];
  isNew: boolean;
}

interface RadarResponse {
  region: string;
  keywords: string[];
  mode: "live" | "dummy";
  announcements: RadarAnnouncement[];
}

const DEFAULT_REGION = "Bilecik Söğüt";
const DEFAULT_KEYWORDS = ["sanayi", "imar planı", "parsel"];

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)} dk önce`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} sa önce`;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function AnnouncementCard({ item }: { item: RadarAnnouncement }) {
  return (
    <Card className="border-border/60 shadow-sm ring-border/60">
      <CardHeader className="gap-3 border-b border-border/50 pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-semibold leading-snug tracking-tight">
            {item.title}
          </CardTitle>
          {item.isNew && (
            <Badge className="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              Yeni
            </Badge>
          )}
        </div>
        <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
          <span>{formatRelativeTime(item.publishedAt)}</span>
          <span className="text-border">·</span>
          <span>{item.source}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.summary}
        </p>

        <div className="flex flex-wrap gap-2">
          {item.matchedKeywords.map((keyword) => (
            <Badge key={keyword} variant="outline" className="font-normal">
              {keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImarRadariView() {
  const [data, setData] = useState<RadarResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRadar() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          region: DEFAULT_REGION,
          keywords: DEFAULT_KEYWORDS.join(","),
        });

        const response = await fetch(`/api/radar?${params.toString()}`);
        const payload: unknown = await response.json();

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Radar verisi alınamadı.";
          throw new Error(message);
        }

        setData(payload as RadarResponse);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Radar verisi alınamadı.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchRadar();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">İmar Radarı</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Bölgesel imar ve sanayi duyurularını anahtar kelime bazlı izleyin.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
        <aside>
          <Card className="border-border/60 shadow-sm ring-border/60">
            <CardHeader className="border-b border-border/50 pb-5">
              <div className="flex items-center gap-2">
                <Radar className="size-4 text-muted-foreground" strokeWidth={1.75} />
                <CardTitle className="text-base font-medium">
                  Radar Konfigürasyonu
                </CardTitle>
              </div>
              <CardDescription>
                Aktif izleme parametreleri
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Bölge
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                  <span className="text-sm font-medium">{DEFAULT_REGION}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Takip Edilen Kelimeler
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_KEYWORDS.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/60 px-4 py-3">
                <Activity
                  className={cn(
                    "size-4",
                    isLoading ? "animate-pulse text-muted-foreground" : "text-emerald-600",
                  )}
                  strokeWidth={1.75}
                />
                <span className="font-mono text-xs tracking-[0.14em] uppercase text-muted-foreground">
                  {isLoading ? "Tarama sürüyor" : "Radar aktif"}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">Canlı Akış</h2>
              <p className="text-sm text-muted-foreground">
                Eşleşen duyurular kronolojik sırayla
              </p>
            </div>
            {data && (
              <p className="font-mono text-xs tracking-[0.14em] uppercase text-muted-foreground">
                {data.mode === "live" ? "Canlı kaynak" : "Örnek akış"}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Duyurular taranıyor…</p>
          ) : data && data.announcements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Seçili kriterlere uygun duyuru bulunamadı.
              </p>
            </div>
          ) : (
            <div className="relative space-y-5 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-border/80">
              {data?.announcements.map((item) => (
                <div key={item.id} className="relative">
                  <span className="absolute top-6 -left-6 size-2 rounded-full bg-foreground/30 ring-4 ring-background" />
                  <AnnouncementCard item={item} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
