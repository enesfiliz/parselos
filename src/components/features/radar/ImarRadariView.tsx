"use client";

import {
  Activity,
  BarChart3,
  Bell,
  Radar,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ImarRegionSearch } from "@/components/features/radar/ImarRegionSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEFAULT_IMAR_KEYWORDS,
  DEFAULT_IMAR_REGION,
  IMAR_KEYWORD_OPTIONS,
  loadImarRadarConfig,
  saveImarRadarConfig,
} from "@/lib/radar/imar-radar-config";
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
  category: "aski" | "plan-degisikligi" | "parsel" | "sanayi" | "diger";
}

interface RadarAnalysis {
  summary: string;
  totalMatches: number;
  newCount: number;
  categories: { id: string; label: string; count: number }[];
  trackedKeywords: string[];
  lastScannedAt: string;
  activityLevel: "dusuk" | "orta" | "yuksek";
}

interface RadarResponse {
  region: string;
  keywords: string[];
  mode: "live" | "dummy";
  announcements: RadarAnnouncement[];
  analysis: RadarAnalysis;
}

const CATEGORY_LABELS: Record<RadarAnnouncement["category"], string> = {
  aski: "Plan Askısı",
  "plan-degisikligi": "Plan Değişikliği",
  parsel: "Parsel",
  sanayi: "Sanayi",
  diger: "Duyuru",
};

const ACTIVITY_STYLES: Record<
  RadarAnalysis["activityLevel"],
  { label: string; className: string }
> = {
  dusuk: {
    label: "Düşük aktivite",
    className: "border-border/60 bg-border/40 text-muted-foreground",
  },
  orta: {
    label: "Orta aktivite",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  yuksek: {
    label: "Yüksek aktivite",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
};

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
          <div className="space-y-2">
            <Badge variant="outline" className="font-normal text-[10px]">
              {CATEGORY_LABELS[item.category]}
            </Badge>
            <CardTitle className="text-base font-semibold leading-snug tracking-tight">
              {item.title}
            </CardTitle>
          </div>
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
        <p className="text-sm leading-relaxed text-muted-foreground">{item.summary}</p>

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

function AnalysisPanel({ analysis }: { analysis: RadarAnalysis }) {
  const activity = ACTIVITY_STYLES[analysis.activityLevel];

  return (
    <Card className="border-[#b38c56]/20 bg-parsel-gold/[0.04] shadow-sm">
      <CardHeader className="gap-3 border-b border-border/40 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-parsel-gold" strokeWidth={1.75} />
            <CardTitle className="text-base font-medium">Bölge Analizi</CardTitle>
          </div>
          <Badge className={cn("font-normal", activity.className)}>
            {activity.label}
          </Badge>
        </div>
        <CardDescription>{analysis.summary}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-foreground0">
            Toplam eşleşme
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {analysis.totalMatches}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-foreground0">
            Yeni duyuru
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            {analysis.newCount}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-foreground0">
            Duyuru tipi
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {analysis.categories.length}
          </p>
        </div>

        {analysis.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2 sm:col-span-3">
            {analysis.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.label} · {category.count}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ImarRadariView() {
  const [region, setRegion] = useState(DEFAULT_IMAR_REGION);
  const [keywords, setKeywords] = useState<string[]>([
    ...DEFAULT_IMAR_KEYWORDS,
  ]);
  const [configReady, setConfigReady] = useState(false);
  const [data, setData] = useState<RadarResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    const saved = loadImarRadarConfig();
    queueMicrotask(() => {
      setRegion(saved.region);
      setKeywords(saved.keywords);
      setConfigReady(true);
    });
  }, []);

  const fetchRadar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        region,
        keywords: keywords.join(","),
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
      saveImarRadarConfig({ region, keywords });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Radar verisi alınamadı.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [region, keywords]);

  useEffect(() => {
    if (!configReady) return;

    const timeoutId = window.setTimeout(() => {
      void fetchRadar();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchRadar, configReady]);

  function toggleKeyword(keyword: string) {
    setKeywords((current) => {
      if (current.includes(keyword)) {
        const next = current.filter((item) => item !== keyword);
        return next.length > 0 ? next : current;
      }
      return [...current, keyword];
    });
  }

  function handleRegionChange(next: { label: string }) {
    setRegion(next.label);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <header className="space-y-2">
        <h1 className="font-outfit text-3xl font-semibold tracking-tight text-foreground">
          İmar Radarı
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Bölge seçin; askı ilanları, plan değişiklikleri ve parsel duyuruları
          otomatik taranır, analiz edilir ve takip edilir.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-14">
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
                Bölge ve anahtar kelimeleri seçerek taramayı başlatın
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Bölge Seçimi
                </p>
                <ImarRegionSearch
                  value={region}
                  onChange={handleRegionChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Takip Edilen Kelimeler
                </p>
                <div className="flex flex-wrap gap-2">
                  {IMAR_KEYWORD_OPTIONS.map((option) => {
                    const active = keywords.includes(option.label);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleKeyword(option.label)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition-colors",
                          active
                            ? "border-[#b38c56]/40 bg-parsel-gold/15 text-[#d4b07a]"
                            : "border-border/60 bg-muted/10 text-foreground0 hover:text-foreground/90",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setKeywords([...DEFAULT_IMAR_KEYWORDS])}
                  className="text-[11px] text-foreground0 underline-offset-2 hover:text-foreground/90 hover:underline"
                >
                  Varsayılana sıfırla
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => void fetchRadar()}
                  disabled={isLoading}
                  className="w-full bg-[#547236] hover:bg-[#547236]/90"
                >
                  <RefreshCw
                    className={cn("size-4", isLoading && "animate-spin")}
                  />
                  {isLoading ? "Taranıyor…" : "Taramayı Güncelle"}
                </Button>

                <Button
                  type="button"
                  variant={isTracking ? "secondary" : "outline"}
                  onClick={() => setIsTracking((current) => !current)}
                  className="w-full"
                >
                  <Bell className="size-4" />
                  {isTracking ? "Takip aktif" : "Takip duraklatıldı"}
                </Button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/60 px-4 py-3">
                <Activity
                  className={cn(
                    "size-4",
                    isLoading
                      ? "animate-pulse text-muted-foreground"
                      : isTracking
                        ? "text-emerald-400"
                        : "text-amber-400",
                  )}
                  strokeWidth={1.75}
                />
                <span className="font-mono text-xs tracking-[0.14em] uppercase text-muted-foreground">
                  {isLoading
                    ? "Tarama sürüyor"
                    : isTracking
                      ? "Radar aktif"
                      : "Takip beklemede"}
                </span>
              </div>

              {isTracking ? (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/90">{region}</span>{" "}
                    için imar askısı ve plan değişikliği duyuruları izleniyor.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                {region} · Canlı Akış
              </h2>
              <p className="text-sm text-muted-foreground">
                Askı, plan değişikliği ve parsel duyuruları
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

          {data?.analysis && !isLoading ? (
            <AnalysisPanel analysis={data.analysis} />
          ) : null}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Duyurular taranıyor…</p>
          ) : data && data.announcements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Seçili bölge ve kelimelere uygun duyuru bulunamadı. Bölge veya
                anahtar kelime seçimini genişletin.
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
