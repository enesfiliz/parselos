"use client";

import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DeedFields = {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
  nitelik: string;
  yuzolcumu: string;
};

type DeedAnalysis = {
  extractedData: {
    il: string;
    ilçe: string;
    mahalle: string;
    ada: string;
    parsel: string;
    nitelik: string;
    yuzolcumu: string;
  };
  riskAnalysis: string[];
  advantages: string[];
  aiSummary: string;
};

type AnalysisStatus = "idle" | "analyzing" | "done" | "error";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const INITIAL_FIELDS: DeedFields = {
  il: "",
  ilce: "",
  mahalle: "",
  ada: "",
  parsel: "",
  nitelik: "",
  yuzolcumu: "",
};

function isAcceptedFile(file: File) {
  return ACCEPTED_TYPES.includes(file.type.toLowerCase());
}

async function analyzeDeed(file: File): Promise<DeedAnalysis> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/analyze-deed", {
    method: "POST",
    body: formData,
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "TapuAI analizi tamamlanamadı.";
    throw new Error(message);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !payload.data ||
    typeof payload.data !== "object"
  ) {
    throw new Error("TapuAI geçerli bir analiz verisi döndürmedi.");
  }

  return payload.data as DeedAnalysis;
}

function FieldInput({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: keyof DeedFields;
  label: string;
  value: string;
  placeholder: string;
  onChange: (id: keyof DeedFields, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(id, event.target.value)}
        className="h-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}

function IntelligenceReport({ result }: { result: DeedAnalysis | null }) {
  return (
    <aside className="bg-parsel-panel border border-border p-5 rounded-2xl">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#b38c56]/25 bg-parsel-gold/10 text-parsel-gold">
          <Brain className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-parsel-gold">
            TapuAI
          </p>
          <h2 className="font-outfit text-lg font-semibold text-foreground">
            TapuAI İstihbarat Raporu
          </h2>
        </div>
      </div>

      {!result ? (
        <div className="rounded-xl border border-border/60 bg-white/[0.03] p-4 text-sm leading-relaxed text-muted-foreground">
          Görsel yüklendiğinde Gemini belgeyi okuyacak, hisse/nitelik sinyallerini
          yorumlayacak ve yatırım odaklı risk-avantaj raporunu burada açacak.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-background/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-parsel-gold">
              <Sparkles className="size-4" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold">Jilet Özet</h3>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {result.aiSummary || "Özet üretilemedi."}
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-red-300">
              <AlertTriangle className="size-4" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold">Risk Analizi</h3>
            </div>
            <ul className="space-y-2">
              {(result.riskAnalysis.length > 0
                ? result.riskAnalysis
                : ["Belirgin risk sinyali tespit edilemedi; resmi takyidat ve imar kontrolü yine de yapılmalı."]
              ).map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2 text-sm leading-relaxed text-foreground/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="size-4" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold">Avantajlar</h3>
            </div>
            <ul className="space-y-2">
              {(result.advantages.length > 0
                ? result.advantages
                : ["Avantaj çıkarımı için görselde yeterli veri bulunamadı."]
              ).map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-sm leading-relaxed text-foreground/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}

export function TapuAiView() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState<DeedFields>(INITIAL_FIELDS);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeedAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const updateField = useCallback((id: keyof DeedFields, value: string) => {
    setFields((current) => ({ ...current, [id]: value }));
  }, []);

  const reset = useCallback(() => {
    setFields(INITIAL_FIELDS);
    setStatus("idle");
    setError(null);
    setResult(null);
    setFileName(null);
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!isAcceptedFile(file)) {
      setError("Yalnızca JPG, PNG veya WEBP dosyaları desteklenir.");
      setStatus("error");
      return;
    }

    setError(null);
    setResult(null);
    setFileName(file.name);
    setStatus("analyzing");

    try {
      const analysis = await analyzeDeed(file);
      const extracted = analysis.extractedData;

      setFields({
        il: extracted.il ?? "",
        ilce: extracted.ilçe ?? "",
        mahalle: extracted.mahalle ?? "",
        ada: extracted.ada ?? "",
        parsel: extracted.parsel ?? "",
        nitelik: extracted.nitelik ?? "",
        yuzolcumu: extracted.yuzolcumu ?? "",
      });
      setResult(analysis);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "TapuAI analizi sırasında beklenmeyen bir hata oluştu.",
      );
    }
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  const isAnalyzing = status === "analyzing";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-outfit text-3xl font-semibold tracking-tight text-foreground">
          TapuAI Analiz Sistemi
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Tapu veya ekspertiz görselini yükleyin; Gemini belge verilerini çıkarıp
          nitelik, hisse ve yatırım sinyallerini profesyonel rapora dönüştürsün.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.78fr)]">
        <div className="space-y-6">
          <Card className="border-border bg-[#0d0d10]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UploadCloud className="size-4 text-parsel-gold" strokeWidth={1.75} />
                Belge Yükleme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-5 rounded-xl border border-dashed px-8 py-12 text-center transition-colors outline-none",
                  "focus-visible:ring-3 focus-visible:ring-[#b38c56]/30",
                  isDragging
                    ? "border-[#b38c56] bg-parsel-gold/10"
                    : "border-white/15 bg-background hover:border-parsel-gold/60 hover:bg-[#111114]",
                  isAnalyzing && "pointer-events-none opacity-70",
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-white/[0.03] text-parsel-gold">
                  {isAnalyzing ? (
                    <Brain className="size-5 animate-pulse" strokeWidth={1.75} />
                  ) : (
                    <UploadCloud className="size-5" strokeWidth={1.75} />
                  )}
                </span>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Tapu veya ekspertiz görselini sürükleyin ya da seçin
                  </p>
                  <p className="text-xs text-foreground0">
                    JPG, PNG, WEBP · analiz Gemini 1.5 Flash ile yapılır
                  </p>
                </div>
              </div>

              {fileName && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{fileName}</p>
                    <p className="text-xs text-foreground0">
                      {isAnalyzing
                        ? "TapuAI belgeyi analiz ediyor"
                        : status === "done"
                          ? "Analiz tamamlandı"
                          : status === "error"
                            ? "Analiz tamamlanamadı"
                            : "Hazır"}
                    </p>
                  </div>
                  <FileText className="size-4 shrink-0 text-foreground0" />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-[#0d0d10]">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-base">Çıkarılan Tapu Verileri</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={reset}
                aria-label="Formu temizle"
                title="Formu temizle"
              >
                <RotateCcw className="size-4" strokeWidth={1.75} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldInput id="il" label="İl" value={fields.il} placeholder="Bilecik" onChange={updateField} />
                <FieldInput id="ilce" label="İlçe" value={fields.ilce} placeholder="Söğüt" onChange={updateField} />
                <FieldInput id="mahalle" label="Mahalle / Köy" value={fields.mahalle} placeholder="Oluklu" onChange={updateField} />
                <FieldInput id="ada" label="Ada" value={fields.ada} placeholder="126" onChange={updateField} />
                <FieldInput id="parsel" label="Parsel" value={fields.parsel} placeholder="58" onChange={updateField} />
                <FieldInput id="yuzolcumu" label="Yüzölçümü" value={fields.yuzolcumu} placeholder="1.250,00 m²" onChange={updateField} />
                <FieldInput id="nitelik" label="Nitelik" value={fields.nitelik} placeholder="Arsa" onChange={updateField} />
              </div>
            </CardContent>
          </Card>
        </div>

        <IntelligenceReport result={result} />
      </div>
    </div>
  );
}
