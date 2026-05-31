"use client";

import { UploadCloud } from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TapuVisionSonucu {
  belge_turu: string;
  sahip_bilgisi: string;
  onemli_detaylar: string;
  risk_analizi: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isAcceptedFile(file: File) {
  return ACCEPTED_TYPES.includes(file.type.toLowerCase());
}

async function analyzeDocument(file: File): Promise<TapuVisionSonucu> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/vision", {
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
        : "Belge analizi sırasında bir hata oluştu.";
    throw new Error(message);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !payload.data ||
    typeof payload.data !== "object"
  ) {
    throw new Error("API yanıtı geçerli bir analiz verisi içermiyor.");
  }

  const data = payload.data as Record<string, unknown>;

  return {
    belge_turu: String(data.belge_turu ?? ""),
    sahip_bilgisi: String(data.sahip_bilgisi ?? ""),
    onemli_detaylar: String(data.onemli_detaylar ?? ""),
    risk_analizi: String(data.risk_analizi ?? ""),
  };
}

function ResultCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "destructive";
}) {
  const isDestructive = variant === "destructive";

  return (
    <Card
      className={cn(
        "border-border/60 shadow-sm ring-border/60",
        isDestructive && "border-destructive/20 bg-destructive/5 ring-destructive/15",
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.16em]",
            isDestructive ? "text-destructive/80" : "text-muted-foreground",
          )}
        >
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-sm leading-relaxed",
            isDestructive ? "font-medium text-destructive" : "text-foreground",
          )}
        >
          {value || "—"}
        </p>
      </CardContent>
    </Card>
  );
}

export function TapuAiView() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TapuVisionSonucu | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!isAcceptedFile(file)) {
      setError("Yalnızca JPG, PNG veya WEBP dosyaları desteklenir.");
      return;
    }

    setError(null);
    setResult(null);
    setFileName(file.name);
    setIsAnalyzing(true);

    try {
      const data = await analyzeDocument(file);
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Belge analizi sırasında bir hata oluştu.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Tapu & Sözleşme AI
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Belge görselini yükleyin; yapay zeka tapu veya sözleşme içeriğini
          yapılandırılmış biçimde analiz etsin.
        </p>
      </header>

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
          "flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border border-dashed px-8 py-14 text-center transition-colors outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          isDragging
            ? "border-foreground/30 bg-muted/40"
            : "border-border/80 bg-background hover:border-foreground/20 hover:bg-muted/20",
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

        <span className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground">
          <UploadCloud className="size-5" strokeWidth={1.75} />
        </span>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            Görseli sürükleyip bırakın veya seçin
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP — tapu veya emlak sözleşmesi
          </p>
        </div>
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
          <p className="font-mono text-xs tracking-[0.18em] uppercase text-muted-foreground">
            Yapay Zeka Analiz Ediyor...
          </p>
        </div>
      )}

      {fileName && !isAnalyzing && (
        <p className="text-center text-xs text-muted-foreground">{fileName}</p>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="grid gap-5 pt-2">
          <ResultCard label="Belge Türü" value={result.belge_turu} />
          <ResultCard label="Sahip Bilgisi" value={result.sahip_bilgisi} />
          <ResultCard label="Önemli Detaylar" value={result.onemli_detaylar} />
          <ResultCard
            label="Risk Analizi"
            value={result.risk_analizi}
            variant="destructive"
          />
        </div>
      )}
    </div>
  );
}
