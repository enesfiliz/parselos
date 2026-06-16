"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Mic, Square } from "lucide-react";

import type { CrmVoicePayload, VoiceCrmLog } from "@/lib/types/crm";
import { VOICE_ERROR_BANNER } from "@/components/features/crm/voice-crm-ui-helpers";
import { cn } from "@/lib/utils";

export type RecorderState = "idle" | "recording" | "processing";

export type VoiceRecordResult = {
  transcript: string;
  data: CrmVoicePayload;
  log?: VoiceCrmLog;
};

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
] as const;

const MIN_RECORDING_SECONDS = 1;
const MIN_BLOB_BYTES = 800;

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

function mapMicrophoneError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return "Mikrofon izni reddedildi. Tarayıcı ayarlarından mikrofon erişimine izin verin.";
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return "Mikrofon bulunamadı. Cihazınızda mikrofon olduğundan emin olun.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "Mikrofon başka bir uygulama tarafından kullanılıyor olabilir.";
    }
  }

  return "Mikrofon erişimi sağlanamadı.";
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

function toVoiceLog(raw: unknown): VoiceCrmLog | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const record = raw as Record<string, unknown>;
  if (!record.id || !record.created_at) return undefined;

  return {
    id: String(record.id),
    created_at: String(record.created_at),
    parsed_json_data: toCrmPayload(record.parsed_json_data as Record<string, unknown>),
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
    throw new Error("Sesli CRM yanıtı işlenemedi.");
  }

  const record = payload as Record<string, unknown>;

  return {
    transcript: String(record.transcript ?? ""),
    data: toCrmPayload(record),
    log: toVoiceLog(record.log),
  };
}

type VoiceRecorderProps = {
  onRecordSuccess?: (result: VoiceRecordResult) => void;
  onStateChange?: (state: RecorderState) => void;
  disabled?: boolean;
};

export function VoiceRecorder({
  onRecordSuccess,
  onStateChange,
  disabled = false,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const isUploadingRef = useRef(false);

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
    if (isUploadingRef.current) return;
    isUploadingRef.current = true;

    try {
      const result = await sendToVoiceApi(file);
      onRecordSuccess?.(result);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ses işlenirken bir hata oluştu.";
      setError(message);
      console.error("[VoiceRecorder]", err);
    } finally {
      isUploadingRef.current = false;
      isStoppingRef.current = false;
      setDuration(0);
      durationRef.current = 0;
      updateState("idle");
    }
  }

  async function startRecording() {
    if (
      disabled ||
      isStartingRef.current ||
      isUploadingRef.current ||
      state !== "idle"
    ) {
      return;
    }

    setError(null);
    isStartingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
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
        const recordedSeconds = durationRef.current;

        clearTimer();
        releaseStream();
        isStoppingRef.current = false;

        if (recordedSeconds < MIN_RECORDING_SECONDS || blob.size < MIN_BLOB_BYTES) {
          setError("Kayıt çok kısa. En az 1 saniye net konuşun.");
          setDuration(0);
          durationRef.current = 0;
          updateState("idle");
          return;
        }

        const file = new File(
          [blob],
          `ses-kaydi-${Date.now()}.${extensionFromMime(type)}`,
          { type },
        );

        void processRecording(file);
      };

      recorder.start();
      isStartingRef.current = false;
      updateState("recording");

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    } catch (err) {
      console.error("[VoiceRecorder] Mikrofon erişimi:", err);
      clearTimer();
      releaseStream();
      isStartingRef.current = false;
      setError(mapMicrophoneError(err));
      updateState("idle");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state !== "recording" ||
      isStoppingRef.current ||
      isUploadingRef.current
    ) {
      return;
    }

    isStoppingRef.current = true;
    updateState("processing");
    clearTimer();
    recorder.stop();
  }

  function handleToggle() {
    if (disabled) return;

    if (state === "recording") {
      stopRecording();
      return;
    }

    if (state === "idle" && !isStartingRef.current && !isUploadingRef.current) {
      void startRecording();
    }
  }

  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isDisabled = disabled || isProcessing;

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
          disabled={isDisabled}
          aria-label={
            isRecording
              ? "Kaydı durdur"
              : isProcessing
                ? "Kayıt işleniyor"
                : "Sesli not kaydını başlat"
          }
          aria-pressed={isRecording}
          className={cn(
            "relative z-10 flex size-24 touch-manipulation items-center justify-center rounded-full border shadow-parsel-sm transition-colors outline-none md:size-28",
            "focus-visible:ring-2 focus-visible:ring-primary/30",
            "disabled:pointer-events-none disabled:opacity-60",
            isRecording
              ? "border-destructive/30 bg-destructive text-destructive-foreground"
              : "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isRecording ? (
            <Square className="size-7 fill-current md:size-8" strokeWidth={0} />
          ) : isProcessing ? (
            <span className="size-7 animate-pulse rounded-full bg-primary-foreground/80 md:size-8" />
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
          {disabled
            ? "Yapılandırma tamamlanana kadar kayıt kullanılamaz."
            : isProcessing
              ? "Ses notu ayrıştırılıyor…"
              : isRecording
                ? "Kayıt devam ediyor — durdurmak için dokunun"
                : "Saha görüşmesini CRM notuna dönüştürün"}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {disabled
            ? "Ses sağlayıcısı ve kayıt altyapısı hazır olduğunda kayıt başlatabilirsiniz."
            : isProcessing
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
        <div className={cn(VOICE_ERROR_BANNER, "w-full")}>
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
