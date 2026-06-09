"use client";

import { useReactToPrint } from "react-to-print";
import {
  Archive,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  DialogFooter,
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

function ArchiveReportPrintBody({
  report,
  snapshot,
}: {
  report: ArchivedAppraisal;
  snapshot: ArchivedReportSnapshot | null;
}) {
  return (
    <div className="space-y-4 p-2 text-sm text-foreground">
      <h2 className="font-outfit text-xl font-bold">{report.baslik}</h2>
      <p className="text-muted-foreground">
        Ada {report.ada} · Parsel {report.parsel} · {report.m2}
      </p>
      {snapshot?.report?.fiyat_analizi?.tahmini_deger ? (
        <p className="text-lg font-semibold">
          Tahmini değer: {snapshot.report.fiyat_analizi.tahmini_deger}
        </p>
      ) : null}
      {snapshot?.report?.uzman_gorusu ? (
        <p className="leading-relaxed">{snapshot.report.uzman_gorusu}</p>
      ) : null}
    </div>
  );
}

export function ArsivView() {
  const printRef = useRef<HTMLDivElement>(null);
  const [reports, setReports] = useState<ArchivedAppraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ArchivedAppraisal | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedReport
      ? `ParselOS_${selectedReport.baslik}`
      : "ParselOS_Rapor",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        const response = await fetch("/api/appraisals");
        const payload: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            payload &&
              typeof payload === "object" &&
              "error" in payload &&
              typeof payload.error === "string"
              ? payload.error
              : "Arşiv yüklenemedi",
          );
        }

        if (
          !cancelled &&
          payload &&
          typeof payload === "object" &&
          "data" in payload &&
          Array.isArray(payload.data)
        ) {
          setReports(payload.data as ArchivedAppraisal[]);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Arşiv yüklenemedi");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadReports();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(report: ArchivedAppraisal) {
    if (!window.confirm(`"${report.baslik}" raporunu silmek istiyor musunuz?`)) {
      return;
    }

    setDeletingId(report.id);
    try {
      const response = await fetch(`/api/appraisals/${report.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Silinemedi.");
      }
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      if (selectedReport?.id === report.id) {
        setSelectedReport(null);
      }
      toast.success("Rapor silindi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Silinemedi.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleShareEmail(report: ArchivedAppraisal) {
    const snapshot = parseSnapshot(report.jsonVerisi);
    const subject = encodeURIComponent(`Ekspertiz: ${report.baslik}`);
    const body = encodeURIComponent(
      [
        `ParselOS Ekspertiz Raporu`,
        ``,
        report.baslik,
        `Ada ${report.ada} · Parsel ${report.parsel}`,
        `Alan: ${report.m2}`,
        snapshot?.report?.fiyat_analizi?.tahmini_deger
          ? `Tahmini değer: ${snapshot.report.fiyat_analizi.tahmini_deger}`
          : "",
        ``,
        snapshot?.report?.uzman_gorusu ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  const snapshot = selectedReport
    ? parseSnapshot(selectedReport.jsonVerisi)
    : null;

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-2 flex items-center gap-2 text-parsel-gold">
          <Archive className="size-4" strokeWidth={2} />
          <span className="parsel-section-label">Kurumsal arşiv</span>
        </div>
        <h1 className="parsel-page-title text-foreground">Ekspertiz Arşivi</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
          Kayıtlı değerleme raporlarını görüntüleyin, PDF indirin, e-posta ile
          paylaşın veya silin.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="parsel-surface animate-pulse">
              <CardHeader>
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="parsel-surface border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Henüz arşivlenmiş rapor yok. Ekspertiz modülünden rapor oluşturup
              arşive kaydedin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((item) => (
            <Card key={item.id} className="parsel-surface flex flex-col">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-bold leading-snug">
                  {item.baslik}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  Ada {item.ada} · Parsel {item.parsel}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-4">
                <div className="text-sm text-muted-foreground">
                  <p>{formatDate(item.olusturulmaTarihi)}</p>
                  <p className="mt-1 font-semibold text-foreground">{item.m2}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedReport(item)}
                  >
                    <Eye className="size-3.5" />
                    Görüntüle
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={deletingId === item.id}
                    onClick={() => void handleDelete(item)}
                    aria-label="Sil"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="hidden">
        {selectedReport ? (
          <div ref={printRef}>
            <ArchiveReportPrintBody report={selectedReport} snapshot={snapshot} />
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(selectedReport)}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedReport ? (
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
                    <p className="parsel-section-label">Alan</p>
                    <p className="mt-1 font-semibold">{selectedReport.m2}</p>
                  </div>
                  {snapshot?.report?.genel_skor !== undefined ? (
                    <div>
                      <p className="parsel-section-label">Yatırım skoru</p>
                      <p className="mt-1 font-semibold">
                        {snapshot.report.genel_skor} / 100
                      </p>
                    </div>
                  ) : null}
                </div>

                {snapshot?.report?.fiyat_analizi?.tahmini_deger ? (
                  <div>
                    <p className="parsel-section-label">Tahmini değer</p>
                    <p className="parsel-metric-value mt-1 text-parsel-gold">
                      {snapshot.report.fiyat_analizi.tahmini_deger}
                    </p>
                  </div>
                ) : null}

                {snapshot?.report?.uzman_gorusu ? (
                  <div>
                    <p className="parsel-section-label">Uzman görüşü</p>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {snapshot.report.uzman_gorusu}
                    </p>
                  </div>
                ) : null}
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePrint()}
                >
                  <Download className="size-4" />
                  PDF İndir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleShareEmail(selectedReport)}
                >
                  <Mail className="size-4" />
                  E-posta Gönder
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deletingId === selectedReport.id}
                  onClick={() => void handleDelete(selectedReport)}
                >
                  <Trash2 className="size-4" />
                  Sil
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
