"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

import type { CrmVoicePayload } from "@/lib/types/crm";
import { cn } from "@/lib/utils";

export type RecorderState = "idle" | "recording" | "processing";

export type VoiceRecordResult = {
  transcript: string;
  data: CrmVoicePayload;
};

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

async function sendToVoiceApi(file: File): Promise<VoiceRecordResult> {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch("/api/voice", {
    method: "POST",
    body: formData,
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Ses işlenirken bir hata oluştu.";
    throw new Error(message);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("API yanıtı geçerli bir JSON nesnesi değil.");
  }

  const record = payload as Record<string, unknown>;

  return {
    transcript: String(record.transcript ?? ""),
    data: toCrmPayload(record),
  };
}

type VoiceRecorderProps = {
  onRecordSuccess?: (result: VoiceRecordResult) => void;
  onStateChange?: (state: RecorderState) => void;
};

export function VoiceRecorder({
  onRecordSuccess,
  onStateChange,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  const updateState = useCallback(
    (next: RecorderState) => {
      setState(next);
      onStateChange?.(next);
    },
    [onStateChange],
  );

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
      const result = await sendToVoiceApi(file);
      onRecordSuccess?.(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ses işlenirken bir hata oluştu.";
      setError(message);
      console.error("[VoiceRecorder]", err);
    } finally {
      setDuration(0);
      durationRef.current = 0;
      updateState("idle");
    }
  }

  async function startRecording() {
    setError(null);

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
      updateState("recording");

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    } catch (err) {
      console.error("[VoiceRecorder] Mikrofon erişimi reddedildi:", err);
      clearTimer();
      releaseStream();
      setError("Mikrofon erişimi reddedildi veya kullanılamıyor.");
      updateState("idle");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== "recording") return;

    updateState("processing");
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
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className={cn(
            "absolute size-28 rounded-full border transition-colors md:size-32",
            isRecording ? "border-primary/25 bg-primary/5" : "border-border/60",
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
                : "Sesli not kaydını başlat"
          }
          aria-pressed={isRecording}
          className={cn(
            "relative z-10 flex size-24 items-center justify-center rounded-full border shadow-parsel-sm transition-colors outline-none md:size-28",
            "focus-visible:ring-2 focus-visible:ring-primary/30",
            "disabled:pointer-events-none disabled:opacity-60",
            isRecording
              ? "border-destructive/30 bg-destructive text-destructive-foreground"
              : "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isRecording ? (
            <Square className="size-7 fill-current md:size-8" strokeWidth={0} />
          ) : (
            <Mic className="size-9 md:size-10" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <p className="font-mono text-2xl tabular-nums tracking-tight text-foreground">
          {formatDuration(duration)}
        </p>
        <p className="text-sm font-medium text-foreground">
          {isProcessing
            ? "Ses notu ayrıştırılıyor…"
            : isRecording
              ? "Kayıt devam ediyor — durdurmak için dokunun"
              : "Saha görüşmesini sesli not olarak kaydedin"}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {isProcessing
            ? "Transkript ve CRM alanları hazırlanıyor."
            : isRecording
              ? "Müşteri adı, bütçe, bölge ve mülk tipini doğal konuşmayla aktarın."
              : "Tek dokunuşla kayda başlayın; not otomatik müşteri profiline dönüşür."}
        </p>
      </div>

      {isRecording ? (
        <div aria-hidden className="flex h-8 items-end justify-center gap-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className="w-1 rounded-full bg-primary/40"
              style={{
                height: `${10 + ((index * 5 + duration) % 18)}px`,
              }}
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="w-full rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}
