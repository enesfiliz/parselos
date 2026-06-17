"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CrmVoicePayload,
  VoiceClientCandidateResponse,
  VoiceCrmLog,
} from "@/lib/types/crm";
import { isVoiceProcessingStale } from "@/lib/voice-crm/voice-processing-policy";
import { cn } from "@/lib/utils";

type VoiceCrmReviewPanelProps = {
  log: VoiceCrmLog;
  transcript: string;
  payload: CrmVoicePayload;
  candidates: VoiceClientCandidateResponse[];
  onApplied: (log: VoiceCrmLog) => void;
  onDismissed: () => void;
  onPayloadChange?: (payload: CrmVoicePayload) => void;
};

const FIELD_LABELS: Partial<Record<keyof CrmVoicePayload, string>> = {
  musteri_adi: "Müşteri",
  telefon: "Telefon",
  eposta: "E-posta",
  butce: "Bütçe",
  lokasyon: "Bölge",
  mulk_tipi: "Mülk tipi",
  niyet: "Niyet",
  aciliyet: "Aciliyet",
  takip_tarihi: "Takip tarihi",
  notlar: "Not",
};

const DISPLAY_FIELD_KEYS = Object.keys(FIELD_LABELS) as Array<keyof CrmVoicePayload>;

export function VoiceCrmReviewPanel({
  log,
  transcript,
  payload,
  candidates,
  onApplied,
  onDismissed,
  onPayloadChange,
}: VoiceCrmReviewPanelProps) {
  const [draft, setDraft] = useState(payload);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    candidates.find((item) => item.confidence === "strong")?.id ?? null,
  );
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const isLinked = Boolean(log.client_id);
  const isProcessed = log.status === "processed" || isLinked;
  const isActiveProcessing =
    log.status === "processing" &&
    !isLinked &&
    !isVoiceProcessingStale(log.updated_at ?? log.created_at);
  const isStaleProcessing =
    log.status === "processing" &&
    !isLinked &&
    isVoiceProcessingStale(log.updated_at ?? log.created_at);

  const displayPayload = useMemo(() => (editing ? draft : payload), [draft, editing, payload]);

  function updateField(key: keyof CrmVoicePayload, value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    onPayloadChange?.(next);
  }

  async function apply(
    action:
      | "create_client"
      | "match_client"
      | "update_client"
      | "note_only"
      | "later"
      | "dismiss"
      | "archive"
      | "unarchive",
  ) {
    if (submitting) return;

    setSubmitting(action);
    try {
      const response = await fetch(`/api/voice/${log.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          clientId: selectedClientId,
          payload: displayPayload,
        }),
      });

      const json = (await response.json()) as {
        log?: VoiceCrmLog;
        error?: string;
      };

      if (!response.ok || !json.log) {
        throw new Error(json.error ?? "İşlem tamamlanamadı.");
      }

      if (action === "dismiss" || action === "later") {
        onDismissed();
      } else {
        onApplied(json.log);
      }

      const successMessage =
        action === "create_client"
          ? isProcessed
            ? "Mevcut müşteri kaydı kullanıldı"
            : "Müşteri kaydı oluşturuldu"
          : action === "match_client" || action === "update_client"
            ? "Müşteri kaydı güncellendi"
            : action === "note_only"
              ? "Not kaydedildi"
              : action === "archive"
                ? "Kayıt arşivlendi"
                : action === "unarchive"
                  ? "Kayıt arşivden çıkarıldı"
                  : "İşlem kaydedildi";

      toast.success(successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "İşlem tamamlanamadı.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-parsel-elevated px-4 py-4">
        <p className="parsel-section-label text-[10px] text-muted-foreground">
          Ham konuşma
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{transcript}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Çıkarılan alanlar</p>
        {!isProcessed ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? "Düzenlemeyi kapat" : "Alanları düzenle"}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DISPLAY_FIELD_KEYS.map((key) => (
          <div
            key={key}
            className={cn(
              "rounded-xl border border-border/60 bg-parsel-elevated px-3 py-3",
              key === "notlar" && "sm:col-span-2",
            )}
          >
            <Label className="text-[10px] text-muted-foreground">
              {FIELD_LABELS[key]}
            </Label>
            {editing && !isProcessed ? (
              <Input
                className="mt-2 h-9"
                value={displayPayload[key] ?? ""}
                onChange={(event) => updateField(key, event.target.value)}
              />
            ) : (
              <p className="mt-1 text-sm text-foreground">
                {displayPayload[key]?.trim() || "—"}
              </p>
            )}
          </div>
        ))}
      </div>

      {isStaleProcessing ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-foreground">
            Önceki işlem tamamlanamadı. Yeniden deneyebilirsiniz.
          </p>
        </div>
      ) : null}

      {isActiveProcessing ? (
        <div className="rounded-xl border border-border/60 bg-parsel-elevated px-4 py-3">
          <p className="text-sm text-muted-foreground">
            İşlem devam ediyor. Birkaç saniye sonra tekrar kontrol edin.
          </p>
        </div>
      ) : null}

      {isLinked && log.client_id ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm text-foreground">Bu kayıt bir müşteriyle ilişkilendirildi.</p>
          <Link
            href={`/customers?client=${log.client_id}`}
            className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
          >
            Müşteri kaydına git
          </Link>
        </div>
      ) : null}

      {!isProcessed && candidates.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Olası eşleşmeler</p>
          <ul className="space-y-2">
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  onClick={() => setSelectedClientId(candidate.id)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                    selectedClientId === candidate.id
                      ? "border-primary/30 bg-primary/10"
                      : "border-border/60 bg-parsel-panel hover:bg-parsel-elevated",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {candidate.adSoyad}
                    </p>
                    <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {candidate.confidenceLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{candidate.reason}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : !isProcessed ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground">
          Mevcut müşteri kayıtlarında güçlü eşleşme bulunamadı. Yeni kayıt oluşturabilirsiniz.
        </p>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-1 border-t border-border/60 bg-parsel-panel/95 px-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!isProcessed ? (
          <>
            <Button
              type="button"
              className="min-h-11"
              disabled={Boolean(submitting) || isActiveProcessing}
              onClick={() => void apply("create_client")}
            >
              {submitting === "create_client" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {isStaleProcessing ? "İşlemi yeniden dene" : "Yeni müşteri oluştur"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              disabled={Boolean(submitting) || !selectedClientId}
              onClick={() => void apply("match_client")}
            >
              Mevcut müşteriyle eşleştir
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={Boolean(submitting) || !selectedClientId}
              onClick={() => void apply("update_client")}
            >
              Mevcut müşteriyi güncelle
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              disabled={Boolean(submitting)}
              onClick={() => void apply("note_only")}
            >
              Sadece not olarak kaydet
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              disabled={Boolean(submitting)}
              onClick={() => void apply("later")}
            >
              Daha sonra işle
            </Button>
          </>
        ) : null}
        {log.status === "archived" ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={Boolean(submitting)}
            onClick={() => void apply("unarchive")}
          >
            Arşivden çıkar
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={Boolean(submitting)}
            onClick={() => void apply("archive")}
          >
            Arşivle
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          disabled={Boolean(submitting)}
          onClick={() => void apply("dismiss")}
        >
          İşlenmedi olarak işaretle
        </Button>
        </div>
      </div>
    </div>
  );
}
