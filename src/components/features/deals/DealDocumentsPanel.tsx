"use client";

import {
  CloudUpload,
  Download,
  FileImage,
  FileText,
  FileType,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { toast } from "sonner";

import {
  createDocumentFromFile,
  formatDocumentSize,
  getInitialDealDocuments,
  type DealDocument,
  type DealDocumentKind,
} from "@/lib/deals/deal-documents";
import { cn } from "@/lib/utils";

const DOCUMENT_ICON: Record<
  DealDocumentKind,
  { icon: typeof FileText; className: string }
> = {
  pdf: { icon: FileText, className: "text-red-400/90" },
  image: { icon: FileImage, className: "text-sky-400/90" },
  word: { icon: FileType, className: "text-indigo-400/90" },
  other: { icon: FileText, className: "text-white/50" },
};

type DealDocumentsPanelProps = {
  dealId: string;
};

export function DealDocumentsPanel({ dealId }: DealDocumentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setDocuments(getInitialDealDocuments(dealId)));
  }, [dealId]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      const created = list.map((file) => createDocumentFromFile(file, dealId));
      setDocuments((current) => [...created, ...current]);
      toast.success(
        created.length === 1
          ? "Evrak yüklendi."
          : `${created.length} evrak yüklendi.`,
      );
    },
    [dealId],
  );

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleDownload(doc: DealDocument) {
    toast.success(`${doc.name} indiriliyor…`);
  }

  function handleDelete(docId: string) {
    setDocuments((current) => current.filter((item) => item.id !== docId));
    toast.success("Evrak silindi.");
  }

  return (
    <div>
      <h3 className="mb-3 mt-6 text-sm font-semibold text-white/90">
        📂 Dijital Arşiv & Evraklar
      </h3>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center transition-all hover:border-[#b38c56]/50 hover:bg-white/10",
          isDragging && "border-[#b38c56]/50 bg-white/10",
        )}
      >
        <CloudUpload
          className="h-8 w-8 text-white/40 transition-colors group-hover:text-[#b38c56]"
          strokeWidth={1.5}
        />
        <p className="mt-2 text-xs text-white/50">
          Evrak yüklemek için sürükleyin veya tıklayın
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {documents.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {documents.map((doc) => {
            const meta = DOCUMENT_ICON[doc.kind];
            const Icon = meta.icon;

            return (
              <li
                key={doc.id}
                className="group flex items-center justify-between rounded-lg border border-white/5 bg-[#09090b] p-3 transition-all hover:border-white/10"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-[#151f23]">
                    <Icon className={cn("h-4 w-4", meta.className)} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white/80">
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {formatDocumentSize(doc.sizeBytes)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span
                          key={`${doc.id}-${tag}`}
                          className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-white/45"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ml-2 flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    title="İndir"
                    onClick={() => handleDownload(doc)}
                    className="text-white/30 transition-colors hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    title="Sil"
                    onClick={() => handleDelete(doc.id)}
                    className="text-white/30 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-center text-[11px] text-white/30">
          Henüz evrak yüklenmedi.
        </p>
      )}
    </div>
  );
}
