"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CrmVoicePayload } from "@/lib/types/crm";
import { cn } from "@/lib/utils";

type RecorderState = "idle" | "recording" | "processing";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
] as const;

function resolveMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";

  for (const type of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  return "";
}

function extensionFromMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4") || mime.includes("mpeg")) return "mp4";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function toCrmPayload(raw: Record<string, unknown>): CrmVoicePayload {
  const source =
    raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : raw;

  return {
    musteri_adi: String(source.musteri_adi ?? ""),
    butce: String(source.butce ?? ""),
    lokasyon: String(source.lokasyon ?? ""),
    mulk_tipi: String(source.mulk_tipi ?? ""),
    notlar: String(source.notlar ?? ""),
  };
}

async function sendToVoiceApi(file: File): Promise<CrmVoicePayload> {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch("/api/voice", {
    method: "POST",
    body: formData,
  });

  const data: unknown = await response.json();
  console.log("API'den Gelen Yanıt:", data);

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Ses işlenirken bir hata oluştu.";
    throw new Error(message);
  }

  if (!data || typeof data !== "object") {
    throw new Error("API yanıtı geçerli bir JSON nesnesi değil.");
  }

  return toCrmPayload(data as Record<string, unknown>);
}

type VoiceRecorderProps = {
  onRecordSuccess?: (data: CrmVoicePayload) => void;
};

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-100">
        {value || "—"}
      </p>
    </div>
  );
}

export function VoiceRecorder({ onRecordSuccess }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [data, setData] = useState<CrmVoicePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      releaseStream();
    };
  }, [clearTimer, releaseStream]);

  async function processRecording(file: File) {
    try {
      const crmData = await sendToVoiceApi(file);
      setData(crmData);
      onRecordSuccess?.(crmData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ses işlenirken bir hata oluştu.";
      setError(message);
      console.error("[VoiceRecorder]", err);
    } finally {
      setDuration(0);
      durationRef.current = 0;
      setState("idle");
    }
  }

  async function startRecording() {
    setError(null);
    setData(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = resolveMimeType();

      streamRef.current = stream;
      chunksRef.current = [];
      durationRef.current = 0;
      setDuration(0);

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const file = new File(
          [blob],
          `ses-kaydi-${Date.now()}.${extensionFromMime(type)}`,
          { type },
        );

        clearTimer();
        releaseStream();
        void processRecording(file);
      };

      recorder.start();
      setState("recording");

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    } catch (err) {
      console.error("[VoiceRecorder] Mikrofon erişimi reddedildi:", err);
      clearTimer();
      releaseStream();
      setError("Mikrofon erişimi reddedildi veya kullanılamıyor.");
      setState("idle");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== "recording") return;

    setState("processing");
    clearTimer();
    recorder.stop();
  }

  function handleToggle() {
    if (state === "recording") {
      stopRecording();
      return;
    }

    if (state === "idle") {
      void startRecording();
    }
  }

  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <div className="flex w-full flex-col items-center gap-12">
      <div className="inline-flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          {isRecording && (
            <span
              aria-hidden
              className="absolute size-28 animate-ping rounded-full bg-foreground/5"
            />
          )}
          <span
            aria-hidden
            className={cn(
              "absolute size-24 rounded-full border transition-colors duration-300",
              isRecording ? "border-foreground/20" : "border-border",
            )}
          />

          <button
            type="button"
            onClick={handleToggle}
            disabled={isProcessing}
            aria-label={
              isRecording
                ? "Kaydı durdur"
                : isProcessing
                  ? "Kayıt işleniyor"
                  : "Ses kaydını başlat"
            }
            aria-pressed={isRecording}
            className={cn(
              "relative z-10 flex size-20 items-center justify-center rounded-full border transition-all duration-300 outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-60",
              isRecording
                ? "border-foreground/30 bg-foreground text-background shadow-lg"
                : "border-border bg-background text-zinc-100 hover:border-foreground/20 hover:bg-muted/30",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "block transition-all duration-300",
                isRecording
                  ? "size-3.5 rounded-sm bg-background"
                  : "size-5 rounded-full bg-foreground",
              )}
            />
          </button>
        </div>

        <div className="flex min-w-[220px] flex-col items-center gap-4">
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] uppercase">
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full transition-colors",
                isRecording
                  ? "animate-pulse bg-foreground"
                  : "bg-muted-foreground/40",
              )}
            />
            <span className="text-zinc-400">
              {isProcessing ? "Sync" : isRecording ? "Rec" : "Standby"}
            </span>
            <span className="text-foreground/80">{formatDuration(duration)}</span>
          </div>

          <div aria-hidden className="flex h-8 items-end justify-center gap-1">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "w-0.5 rounded-full bg-foreground/15 transition-all duration-300",
                  isRecording ? "animate-pulse bg-foreground/50" : "h-2",
                )}
                style={
                  isRecording
                    ? {
                        height: `${10 + ((index * 7 + duration) % 22)}px`,
                        animationDelay: `${index * 70}ms`,
                      }
                    : undefined
                }
              />
            ))}
          </div>

          <p className="max-w-xs text-center text-xs leading-relaxed text-zinc-400">
            {isProcessing
              ? "Ses notu API'ye gönderiliyor…"
              : isRecording
                ? "Durdurmak için tekrar dokunun."
                : "Kayda başlamak için dokunun."}
          </p>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {data && !onRecordSuccess && (
        <div className="w-full max-w-2xl pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DataCard label="Müşteri Adı" value={data.musteri_adi} />
            <DataCard label="Bütçe" value={data.butce} />
            <DataCard label="Lokasyon" value={data.lokasyon} />
            <DataCard label="Mülk Tipi" value={data.mulk_tipi} />
            <DataCard label="Notlar" value={data.notlar} />
          </div>
        </div>
      )}
    </div>
  );
}
