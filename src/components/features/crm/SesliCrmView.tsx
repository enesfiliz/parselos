"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Mic,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { VoiceRecorder } from "@/components/features/crm/VoiceRecorder";
import type { RecorderState } from "@/components/features/crm/VoiceRecorder";
import {
  computeVoiceMetrics,
  CRM_PREVIEW_FIELDS,
  formatRelativeVoiceDate,
  formatVoiceLogDate,
  inferAciliyet,
  METRIC_CARD,
  WORKFLOW_STEPS,
  type WorkflowStep,
} from "@/components/features/crm/voice-crm-ui-helpers";
import type { CrmVoicePayload, VoiceCrmLog } from "@/lib/types/crm";
import { cn } from "@/lib/utils";

function resolveWorkflowStep(
  recorderState: RecorderState,
  hasPreview: boolean,
): WorkflowStep {
  if (recorderState === "recording") return 1;
  if (recorderState === "processing") return 2;
  if (hasPreview) return 4;
  return 1;
}

function WorkflowStepper({ activeStep }: { activeStep: WorkflowStep }) {
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {WORKFLOW_STEPS.map((item) => {
        const isActive = item.step === activeStep;
        const isComplete = item.step < activeStep;

        return (
          <li
            key={item.step}
            className={cn(
              "rounded-2xl border px-3 py-3",
              isActive
                ? "border-primary/25 bg-primary/10"
                : isComplete
                  ? "border-border/60 bg-parsel-elevated"
                  : "border-border/60 bg-parsel-panel",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-primary/15 text-primary"
                      : "bg-parsel-sunken text-muted-foreground",
                )}
              >
                {isComplete ? <CheckCircle2 className="size-3.5" /> : item.step}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-primary" : "text-foreground",
                  )}
                >
                  {item.label}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PreviewField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-parsel-elevated px-3 py-3">
      <p className="parsel-section-label text-[10px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-sm leading-relaxed",
          highlight ? "font-semibold text-parsel-gold" : "text-foreground",
        )}
      >
        {value.trim() || "—"}
      </p>
    </div>
  );
}

function VoiceCrmLogCard({ log }: { log: VoiceCrmLog }) {
  const data = log.parsed_json_data;
  const title = data.musteri_adi?.trim() || "İsimsiz müşteri";
  const aciliyet = inferAciliyet(data.notlar);

  return (
    <li className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-foreground">{title}</p>
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                aciliyet.className,
              )}
            >
              {aciliyet.label}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3 shrink-0" />
            {formatRelativeVoiceDate(log.created_at)}
            <span className="text-muted-foreground/50">·</span>
            {formatVoiceLogDate(log.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0" />
          {data.lokasyon?.trim() || "Bölge yok"}
        </span>
        <span className="inline-flex items-center gap-1 truncate">
          <Wallet className="size-3 shrink-0" />
          {data.butce?.trim() || "Bütçe yok"}
        </span>
        <span className="col-span-2 truncate">Mülk: {data.mulk_tipi?.trim() || "—"}</span>
      </div>

      {data.notlar?.trim() ? (
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {data.notlar}
        </p>
      ) : null}
    </li>
  );
}

type SesliCrmViewProps = {
  initialLogs: VoiceCrmLog[];
  initialError?: string | null;
};

export function SesliCrmView({
  initialLogs,
  initialError = null,
}: SesliCrmViewProps) {
  const [logs, setLogs] = useState<VoiceCrmLog[]>(initialLogs);
  const [fetchError] = useState<string | null>(initialError);
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [preview, setPreview] = useState<CrmVoicePayload | null>(null);

  const metrics = useMemo(() => computeVoiceMetrics(logs), [logs]);
  const workflowStep = resolveWorkflowStep(recorderState, Boolean(preview));
  const previewAciliyet = preview ? inferAciliyet(preview.notlar) : null;

  function handleStateChange(state: RecorderState) {
    setRecorderState(state);
    if (state === "recording") {
      setTranscript(null);
      setPreview(null);
    }
  }

  function handleRecordSuccess(result: { transcript: string; data: CrmVoicePayload }) {
    setTranscript(result.transcript);
    setPreview(result.data);
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        parsed_json_data: result.data,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  return (
    <div className="min-h-full bg-parsel-canvas">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-3">
          <p className="parsel-section-label text-primary">Saha operasyonu</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="parsel-page-title text-foreground">Sesli CRM</h1>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-parsel-panel px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-parsel-sm">
              {logs.length} kayıt
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Saha görüşmesini sesli not olarak kaydedin; transkript ve müşteri profili otomatik
            ayrıştırılsın, takip listesine eklensin.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Toplam not</p>
            <p className="parsel-metric-value mt-2 text-foreground">{metrics.total}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Bütçe tanımlı</p>
            <p className="parsel-metric-value mt-2 text-parsel-gold">{metrics.withBudget}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Bölge tanımlı</p>
            <p className="parsel-metric-value mt-2 text-primary">{metrics.withLocation}</p>
          </article>
          <article className={METRIC_CARD}>
            <p className="text-[11px] font-medium text-muted-foreground">Acil takip</p>
            <p className="parsel-metric-value mt-2 text-foreground">{metrics.urgent}</p>
          </article>
        </section>

        <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm sm:p-5">
          <p className="parsel-section-label text-muted-foreground">İş akışı</p>
          <div className="mt-3">
            <WorkflowStepper activeStep={workflowStep} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm sm:p-6">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Mic className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Sesli not ekle</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Büyük kayıt butonu ile sahadan tek elle not alın.
                </p>
              </div>
            </div>
            <VoiceRecorder
              onStateChange={handleStateChange}
              onRecordSuccess={handleRecordSuccess}
            />
          </section>

          <div className="space-y-6">
            <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Transkript</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ham ses notunun metin çıktısı
                  </p>
                </div>
                {recorderState === "processing" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    <Loader2 className="size-3 animate-spin" />
                    İşleniyor
                  </span>
                ) : null}
              </div>

              {transcript ? (
                <p className="rounded-xl border border-border/60 bg-parsel-elevated px-4 py-4 text-sm leading-relaxed text-foreground">
                  {transcript}
                </p>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-parsel-elevated/60 px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {recorderState === "processing"
                      ? "Transkript hazırlanıyor…"
                      : "Kayıt tamamlandığında transkript burada görünür."}
                  </p>
                </div>
              )}
            </section>

            <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Sparkles className="size-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      AI ayrıştırma önizlemesi
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Müşteri profili alanları
                    </p>
                  </div>
                </div>
                {previewAciliyet ? (
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      previewAciliyet.className,
                    )}
                  >
                    Aciliyet: {previewAciliyet.label}
                  </span>
                ) : null}
              </div>

              {preview ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {CRM_PREVIEW_FIELDS.map(({ key, label }) => (
                    <PreviewField
                      key={key}
                      label={label}
                      value={preview[key]}
                      highlight={key === "butce"}
                    />
                  ))}
                  <div className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <p className="flex items-center gap-2 text-xs font-medium text-primary">
                      <CheckCircle2 className="size-3.5" />
                      CRM kaydı oluşturuldu ve takip listesine eklendi
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-parsel-elevated/60 px-4 py-10 text-center">
                  <UserRound className="mx-auto size-8 text-muted-foreground/60" strokeWidth={1.25} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {recorderState === "processing"
                      ? "Müşteri alanları ayrıştırılıyor…"
                      : "Sesli not işlendikten sonra müşteri, bütçe ve bölge alanları burada görünür."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Son sesli notlar</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Geçmiş saha kayıtları ve takip özeti
              </p>
            </div>
            {!fetchError ? (
              <p className="text-xs text-muted-foreground">{logs.length} kayıt</p>
            ) : null}
          </div>

          {fetchError ? (
            <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{fetchError}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="parsel-surface rounded-2xl border border-dashed border-border/60 bg-parsel-panel px-6 py-14 text-center shadow-parsel-sm">
              <Mic className="mx-auto size-10 text-primary/70" strokeWidth={1.25} />
              <p className="mt-4 text-sm font-semibold text-foreground">Henüz sesli not yok</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                İlk saha görüşmenizi kaydedin; transkript ve müşteri profili otomatik oluşur.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {logs.map((log) => (
                <VoiceCrmLogCard key={log.id} log={log} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
