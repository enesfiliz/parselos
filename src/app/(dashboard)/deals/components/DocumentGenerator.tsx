"use client";

import dynamic from "next/dynamic";
import { Download, FileText, Share2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEAL_DOCUMENT_META,
  getDealPdfDocument,
  type DealDocumentType,
} from "@/lib/documents/deal-pdf-documents";
import type { DealCardData } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[58vh] items-center justify-center rounded-xl border border-border bg-parsel-sunken">
        <p className="text-sm text-foreground0">PDF önizlemesi hazırlanıyor…</p>
      </div>
    ),
  },
);

type DocumentGeneratorProps = {
  deal: DealCardData;
};

const DOCUMENT_BUTTONS: {
  type: DealDocumentType;
  label: string;
}[] = [
  { type: "yetki-belgesi", label: "Yetki Belgesi Oluştur" },
  { type: "yer-gosterme", label: "Yer Gösterme Formu Oluştur" },
];

export function DocumentGenerator({ deal }: DocumentGeneratorProps) {
  const [previewType, setPreviewType] = useState<DealDocumentType | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);

  const previewDocument = useMemo(() => {
    if (!previewType) return null;
    return getDealPdfDocument(previewType, deal);
  }, [deal, previewType]);

  const previewMeta = previewType ? DEAL_DOCUMENT_META[previewType] : null;

  const buildFilename = useCallback(
    (type: DealDocumentType) => {
      const slug = deal.client.adSoyad
        .toLocaleLowerCase("tr-TR")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      return `${DEAL_DOCUMENT_META[type].filename}-${slug || "musteri"}.pdf`;
    },
    [deal.client.adSoyad],
  );

  const handleDownloadOrShare = useCallback(async () => {
    if (!previewType) return;

    setIsExporting(true);

    try {
      const documentNode = getDealPdfDocument(previewType, deal);
      const blob = await pdf(documentNode).toBlob();
      const filename = buildFilename(previewType);
      const file = new File([blob], filename, { type: "application/pdf" });

      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: previewMeta?.title,
          text: `${deal.client.adSoyad} — ${previewMeta?.title}`,
          files: [file],
        });
        toast.success("Evrak paylaşım menüsü açıldı.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("PDF indirildi.");
    } catch (error) {
      console.error("[DocumentGenerator]", error);
      toast.error("Evrak dışa aktarılamadı.");
    } finally {
      setIsExporting(false);
    }
  }, [buildFilename, deal, previewMeta, previewType]);

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground0">
          Resmi Evraklar
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Fırsat verilerinden otomatik PDF üretin ve önizleyin.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {DOCUMENT_BUTTONS.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => setPreviewType(item.type)}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-xl border border-border bg-parsel-panel px-4 py-3 text-left text-sm font-medium text-foreground transition-colors",
              "hover:bg-[#1a262b] hover:border-border",
            )}
          >
            <FileText className="size-4 shrink-0 text-parsel-gold" strokeWidth={1.5} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <Dialog
        open={previewType !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewType(null);
        }}
      >
        <DialogContent
          showCloseButton
          className="max-h-[92vh] w-[min(100vw-2rem,920px)] overflow-hidden border border-border bg-parsel-sunken p-0 text-foreground sm:max-w-[920px]"
        >
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="font-outfit text-lg text-foreground">
              {previewMeta?.title} — Önizleme
            </DialogTitle>
            <p className="text-xs text-foreground0">
              {deal.client.adSoyad} · {deal.property.ilanBasligi}
            </p>
          </DialogHeader>

          <div className="overflow-hidden bg-zinc-950 px-4 py-4">
            {previewDocument ? (
              <div className="h-[58vh] overflow-hidden rounded-xl border border-border">
                <PDFViewer width="100%" height="100%" showToolbar={false}>
                  {previewDocument}
                </PDFViewer>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={() => void handleDownloadOrShare()}
              disabled={isExporting}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[#09090b] transition-all",
                "bg-parsel-gold hover:bg-[#c49a67] disabled:cursor-not-allowed disabled:opacity-60",
                "shadow-[0_0_24px_rgba(179,140,86,0.25)]",
              )}
            >
              {isExporting ? (
                <Download className="size-4 animate-pulse" />
              ) : (
                <Share2 className="size-4" />
              )}
              İndir / Paylaş
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
