"use client";

import { Archive, Eye, FileText, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type {
  ArchivedAppraisal,
  ArchivedReportSnapshot,
} from "@/lib/types/archived-appraisal";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseSnapshot(jsonVerisi: string): ArchivedReportSnapshot | null {
  try {
    return JSON.parse(jsonVerisi) as ArchivedReportSnapshot;
  } catch {
    return null;
  }
}

export function ArsivView() {
  const [reports, setReports] = useState<ArchivedAppraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ArchivedAppraisal | null>(
    null,
  );

  const fetchReports = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/appraisals");
      const payload: unknown = await response.json();

      if (!response.ok) {
        const apiError =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Arşiv yüklenemedi";

        const apiDetails =
          payload &&
          typeof payload === "object" &&
          "details" in payload &&
          typeof payload.details === "string"
            ? payload.details
            : null;

        throw new Error(apiDetails ? `${apiError}: ${apiDetails}` : apiError);
      }

      if (
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(payload.data)
      ) {
        setReports(payload.data as ArchivedAppraisal[]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Arşiv yüklenemedi";
      toast.error("Arşiv yüklenemedi", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const snapshot = selectedReport
    ? parseSnapshot(selectedReport.jsonVerisi)
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Archive className="size-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
            Kurumsal Arşiv
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Ekspertiz Arşivi</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Kaydettiğiniz tüm değerleme raporları güvenle saklanır. Geçmiş analizlere
          tek tıkla ulaşın ve müşteri sunumlarınızı yeniden kullanın.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="border-border/60 shadow-sm ring-border/60"
            >
              <CardHeader className="space-y-3">
                <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
              </CardHeader>
              <CardContent>
                <div className="h-9 w-full animate-pulse rounded-lg bg-neutral-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-border/60 shadow-lg ring-border/60">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <FileText className="size-8 text-neutral-300" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              Henüz arşivlenmiş rapor yok. Ekspertiz modülünden rapor oluşturup
              &quot;Raporu Arşive Kaydet&quot; ile ekleyebilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col border-border/60 shadow-lg ring-1 ring-neutral-100/80 transition-shadow hover:shadow-xl"
            >
              <CardHeader className="space-y-3 border-b border-border/50 pb-5">
                <CardTitle className="text-base font-semibold leading-snug tracking-tight">
                  {item.baslik}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <MapPin className="size-3.5" />
                  Ada {item.ada} · Parsel {item.parsel}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between gap-5 pt-5">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{formatDate(item.olusturulmaTarihi)}</p>
                  <p className="font-medium text-neutral-900">{item.m2}</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-neutral-200 bg-white shadow-sm"
                  onClick={() => setSelectedReport(item)}
                >
                  <Eye className="size-4" />
                  Raporu Görüntüle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(selectedReport)}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReport.baslik}</DialogTitle>
                <DialogDescription>
                  Ada {selectedReport.ada} · Parsel {selectedReport.parsel} ·{" "}
                  {formatDate(selectedReport.olusturulmaTarihi)}
                </DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                      Alan
                    </p>
                    <p className="mt-1 font-medium text-neutral-900">
                      {selectedReport.m2}
                    </p>
                  </div>
                  {snapshot?.report?.genel_skor !== undefined && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                        Yatırım Skoru
                      </p>
                      <p className="mt-1 font-medium text-neutral-900">
                        {snapshot.report.genel_skor} / 100
                      </p>
                    </div>
                  )}
                </div>

                {snapshot?.report?.fiyat_analizi?.tahmini_deger && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                      Tahmini Değer
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      {snapshot.report.fiyat_analizi.tahmini_deger}
                    </p>
                  </div>
                )}

                {snapshot?.report?.uzman_gorusu && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                      Uzman Görüşü
                    </p>
                    <p className="mt-2 leading-relaxed text-neutral-600">
                      {snapshot.report.uzman_gorusu}
                    </p>
                  </div>
                )}

                {!snapshot && (
                  <p className="text-muted-foreground">
                    Rapor detayları arşiv formatında saklanmış; önizleme için JSON
                    verisi mevcut.
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
