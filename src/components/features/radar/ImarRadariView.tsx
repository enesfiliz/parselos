"use client";

import { useUser } from "@clerk/nextjs";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bookmark,
  MapPinned,
  Plus,
  Radar,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ImarAnnouncementCard } from "@/components/features/radar/ImarAnnouncementCard";
import { ImarManualEntryDrawer } from "@/components/features/radar/ImarManualEntryDrawer";
import { ImarRadarDetailDrawer } from "@/components/features/radar/ImarRadarDetailDrawer";
import { ImarRegionSearch } from "@/components/features/radar/ImarRegionSearch";
import {
  IMAR_OFFICIAL_DISCLAIMER,
  IMAR_TRUST_LABELS,
  apiAnnouncementToItem,
  computeImarMetrics,
  formatImarRelativeTime,
  manualRecordToItem,
  matchesImarFilters,
} from "@/components/features/radar/imar-radar-ui-helpers";
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
import {
  loadManualImarRecords,
  loadTrackedRegions,
  loadTrackingEnabled,
  loadTrackingMeta,
  registerTrackedRegion,
  saveManualImarRecord,
  saveTrackingEnabled,
  saveTrackingMeta,
} from "@/lib/radar/imar-radar-store";
import type {
  ImarRadarApiResponse,
  ImarRadarFilters,
  ImarRadarItem,
  ManualImarRecordInput,
} from "@/lib/radar/imar-radar-types";
import { cn } from "@/lib/utils";

const METRIC_CARD =
  "parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "Tüm türler" },
  { value: "aski", label: "Askı ilanı" },
  { value: "plan-degisikligi", label: "Plan değişikliği" },
  { value: "duyuru", label: "Duyuru" },
  { value: "parsel", label: "Parsel" },
  { value: "sanayi", label: "Sanayi" },
  { value: "manuel", label: "Manuel" },
] as const;

const TRUST_FILTER_OPTIONS = [
  { value: "all", label: "Tüm durumlar" },
  { value: "verified", label: IMAR_TRUST_LABELS.verified },
  { value: "needs_official_check", label: IMAR_TRUST_LABELS.needs_official_check },
  { value: "source_pending", label: IMAR_TRUST_LABELS.source_pending },
  { value: "manual", label: IMAR_TRUST_LABELS.manual },
] as const;

export function ImarRadariView() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const storageUserId = user?.id ?? null;

  const [region, setRegion] = useState(DEFAULT_IMAR_REGION);
  const [keywords, setKeywords] = useState<string[]>([...DEFAULT_IMAR_KEYWORDS]);
  const [configReady, setConfigReady] = useState(false);
  const [data, setData] = useState<ImarRadarApiResponse | null>(null);
  const [manualRecords, setManualRecords] = useState<ReturnType<typeof loadManualImarRecords>>([]);
  const [trackingMeta, setTrackingMeta] = useState<ReturnType<typeof loadTrackingMeta>>({});
  const [trackedRegions, setTrackedRegions] = useState<string[]>([]);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [detailItem, setDetailItem] = useState<ImarRadarItem | null>(null);
  const [filters, setFilters] = useState<ImarRadarFilters>({
    category: "all",
    trust: "all",
    trackedOnly: false,
    query: "",
  });

  useEffect(() => {
    if (!isLoaded || !storageUserId) return;

    const saved = loadImarRadarConfig(storageUserId);
    queueMicrotask(() => {
      setRegion(saved.region);
      setKeywords(saved.keywords);
      setIsTrackingEnabled(loadTrackingEnabled(storageUserId));
      setManualRecords(loadManualImarRecords(storageUserId));
      setTrackingMeta(loadTrackingMeta(storageUserId));
      setTrackedRegions(loadTrackedRegions(storageUserId));
      setConfigReady(true);
    });
  }, [isLoaded, storageUserId]);

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

      setData(payload as ImarRadarApiResponse);
      if (storageUserId) {
        saveImarRadarConfig({ region, keywords }, storageUserId);
        registerTrackedRegion(storageUserId, region);
        setTrackedRegions(loadTrackedRegions(storageUserId));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Radar verisi alınamadı.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [region, keywords, storageUserId]);

  useEffect(() => {
    if (!configReady) return;
    const timeoutId = window.setTimeout(() => {
      void fetchRadar();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchRadar, configReady]);

  const allItems = useMemo(() => {
    const apiItems =
      data?.announcements.map((item) =>
        apiAnnouncementToItem(item, trackingMeta[item.id]),
      ) ?? [];
    const manualItems = manualRecords.map(manualRecordToItem);
    return [...manualItems, ...apiItems];
  }, [data?.announcements, manualRecords, trackingMeta]);

  const filteredItems = useMemo(
    () => allItems.filter((item) => matchesImarFilters(item, filters)),
    [allItems, filters],
  );

  const metrics = useMemo(
    () => computeImarMetrics(allItems, trackedRegions),
    [allItems, trackedRegions],
  );

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

  function refreshLocalState() {
    if (!storageUserId) return;
    setManualRecords(loadManualImarRecords(storageUserId));
    setTrackingMeta(loadTrackingMeta(storageUserId));
    setTrackedRegions(loadTrackedRegions(storageUserId));
  }

  function handleToggleTrack(item: ImarRadarItem) {
    if (!storageUserId) return;
    const nextTracked = !item.isTracked;
    saveTrackingMeta(storageUserId, item.id, {
      tracked: nextTracked,
      userVerified: trackingMeta[item.id]?.userVerified,
      note: trackingMeta[item.id]?.note,
    });
    refreshLocalState();
    toast.success(nextTracked ? "Takibe alındı" : "Takip kaldırıldı", {
      description: item.title,
    });
    if (detailItem?.id === item.id) {
      setDetailItem({ ...item, isTracked: nextTracked });
    }
  }

  function handleMarkVerified(item: ImarRadarItem) {
    if (!storageUserId) return;
    saveTrackingMeta(storageUserId, item.id, {
      tracked: true,
      userVerified: true,
      note: item.verificationNote,
    });
    refreshLocalState();
    toast.success("Kayıt doğrulandı olarak işaretlendi");
    if (detailItem?.id === item.id) {
      setDetailItem({
        ...item,
        isTracked: true,
        trustStatus: "verified",
      });
    }
  }

  function handleCreateTask(item: ImarRadarItem) {
    router.push(`/calendar?note=${encodeURIComponent(`İmar takibi: ${item.title}`)}`);
  }

  async function handleManualSubmit(values: ManualImarRecordInput) {
    if (!storageUserId) return;
    setIsSavingManual(true);
    try {
      const record = saveManualImarRecord(storageUserId, values);
      if (values.tracking) {
        saveTrackingMeta(storageUserId, record.id, {
          tracked: true,
          note: values.verificationNote,
        });
      }
      refreshLocalState();
      toast.success("Manuel imar kaydı eklendi");
    } finally {
      setIsSavingManual(false);
    }
  }

  function handleTrackingToggle() {
    if (!storageUserId) return;
    const next = !isTrackingEnabled;
    setIsTrackingEnabled(next);
    saveTrackingEnabled(storageUserId, next);
  }

  const lastScannedAt = data?.analysis.lastScannedAt;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="parsel-section-label text-primary">İstihbarat merkezi</p>
            <h1 className="parsel-page-title text-foreground">İmar Radarı</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Bölgesel askı ilanları, plan değişiklikleri ve resmi duyuruları tek
              panelde izleyin. Manuel takip kayıtları ekleyin, doğrulama durumunu
              yönetin ve kritik kayıtları ajandaya taşıyın.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setManualOpen(true)}>
              <Plus className="size-4" />
              Manuel kayıt ekle
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void fetchRadar()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
              Taramayı güncelle
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-foreground/85">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>{IMAR_OFFICIAL_DISCLAIMER}</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Takip edilen bölge</p>
          <p className="parsel-metric-value mt-2 text-foreground">{metrics.trackedRegions}</p>
        </article>
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Aktif askı / plan</p>
          <p className="parsel-metric-value mt-2 text-parsel-gold">{metrics.activeSuspension}</p>
        </article>
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Son tarama</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {lastScannedAt ? formatImarRelativeTime(lastScannedAt) : "—"}
          </p>
        </article>
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Doğrulanmış kayıt</p>
          <p className="parsel-metric-value mt-2 text-primary">{metrics.verifiedCount}</p>
        </article>
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Kritik takip</p>
          <p className="parsel-metric-value mt-2 text-foreground">{metrics.criticalCount}</p>
        </article>
      </section>

      <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="border-border/60 shadow-parsel-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Radar className="size-4 text-primary" strokeWidth={1.75} />
                <CardTitle className="text-base font-medium">Radar ayarları</CardTitle>
              </div>
              <CardDescription>Bölge ve anahtar kelime taraması</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Bölge seçimi
                </p>
                <ImarRegionSearch
                  value={region}
                  onChange={handleRegionChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Takip kelimeleri
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
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border/60 bg-parsel-elevated text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleTrackingToggle}
                  variant={isTrackingEnabled ? "secondary" : "outline"}
                  className="w-full"
                >
                  <Bell className="size-4" />
                  {isTrackingEnabled ? "Takip aktif" : "Takip duraklatıldı"}
                </Button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-parsel-elevated px-4 py-3">
                <Activity
                  className={cn(
                    "size-4",
                    isLoading
                      ? "animate-pulse text-muted-foreground"
                      : isTrackingEnabled
                        ? "text-primary"
                        : "text-amber-600 dark:text-amber-400",
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Tarama sürüyor"
                    : isTrackingEnabled
                      ? `${region} izleniyor`
                      : "Takip beklemede"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-parsel-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-medium">Filtreler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <input
                value={filters.query}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="Başlık, özet veya bölge ara..."
                className="h-10 w-full rounded-xl border border-border/60 bg-parsel-elevated px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Kayıt tipi
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          category: option.value,
                        }))
                      }
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px]",
                        filters.category === option.value
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Güvenilirlik
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRUST_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFilters((current) => ({ ...current, trust: option.value }))
                      }
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px]",
                        filters.trust === option.value
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground/85">
                <input
                  type="checkbox"
                  checked={filters.trackedOnly}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      trackedOnly: event.target.checked,
                    }))
                  }
                  className="size-4 rounded border-border"
                />
                Yalnızca takiptekiler
              </label>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {region} · İmar akışı
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} kayıt listeleniyor
                {data?.analysis.scannedSources
                  ? ` · ${data.analysis.scannedSources} resmi kaynak tarandı`
                  : ""}
              </p>
            </div>
            {data ? (
              <Badge variant="outline" className="font-normal">
                {data.mode === "live" ? "Canlı tarama" : "Eşleşme yok"}
              </Badge>
            ) : null}
          </div>

          {data?.analysis ? (
            <Card className="border-border/60 bg-parsel-panel shadow-parsel-sm">
              <CardHeader className="gap-2 border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <CardTitle className="text-base font-medium">Bölge özeti</CardTitle>
                </div>
                <CardDescription>{data.analysis.summary}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-4">
                {data.analysis.categories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.label} · {category.count}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Duyurular taranıyor…</p>
          ) : filteredItems.length === 0 ? (
            <div className="parsel-surface rounded-2xl border border-dashed border-border/60 px-8 py-16 text-center">
              <MapPinned className="mx-auto size-8 text-primary/70" />
              <p className="mt-4 text-sm font-medium text-foreground">
                Eşleşen imar kaydı bulunamadı
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Bölge veya filtreleri genişletin ya da manuel takip kaydı ekleyin.
              </p>
              <Button type="button" className="mt-6" onClick={() => setManualOpen(true)}>
                <Plus className="size-4" />
                Manuel kayıt ekle
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredItems.map((item) => (
                <ImarAnnouncementCard
                  key={item.id}
                  item={item}
                  onOpenDetail={setDetailItem}
                  onToggleTrack={handleToggleTrack}
                  onCreateTask={handleCreateTask}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Bookmark className="size-3.5" />
            <span>{metrics.trackedItems} kayıt aktif takipte</span>
            <span className="text-border">·</span>
            <Link href="/calendar" className="text-primary hover:underline">
              Ajandada görevleri yönet
            </Link>
          </div>
        </section>
      </div>

      <ImarManualEntryDrawer
        open={manualOpen}
        defaultRegion={region}
        isSubmitting={isSavingManual}
        onOpenChange={setManualOpen}
        onSubmit={handleManualSubmit}
      />

      <ImarRadarDetailDrawer
        open={detailItem !== null}
        item={detailItem}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null);
        }}
        onToggleTrack={handleToggleTrack}
        onMarkVerified={handleMarkVerified}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
