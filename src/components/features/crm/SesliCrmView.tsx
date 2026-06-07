"use client";

import { useState } from "react";

import { VoiceRecorder } from "@/components/features/crm/VoiceRecorder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CrmVoicePayload, VoiceCrmLog } from "@/lib/types/crm";

const CRM_FIELDS: { key: keyof CrmVoicePayload; label: string }[] = [
  { key: "musteri_adi", label: "Müşteri Adı" },
  { key: "butce", label: "Bütçe" },
  { key: "lokasyon", label: "Lokasyon" },
  { key: "mulk_tipi", label: "Mülk Tipi" },
  { key: "notlar", label: "Notlar" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function VoiceCrmLogCard({ log }: { log: VoiceCrmLog }) {
  const { parsed_json_data: data } = log;
  const title = data.musteri_adi || "İsimsiz Müşteri";

  return (
    <Card className="border-border/60 shadow-none ring-border/60">
      <CardHeader className="border-b border-border/50 pb-5">
        <CardTitle className="text-lg font-semibold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription>{formatDate(log.created_at)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        {CRM_FIELDS.filter(({ key }) => key !== "musteri_adi").map(
          ({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {label}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {data[key] || "—"}
              </p>
            </div>
          ),
        )}
      </CardContent>
    </Card>
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

  function handleRecordSuccess(crmData: CrmVoicePayload) {
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        parsed_json_data: crmData,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16">
      <header className="space-y-2">
        <h1 className="font-outfit text-3xl font-semibold tracking-tight text-foreground">Sesli CRM</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Müşteri notunuzu kaydedin; Groq ile yapılandırılmış CRM verisine
          dönüştürülsün ve anında listeye eklensin.
        </p>
      </header>

      <section className="flex justify-center border-b border-border/60 pb-16">
        <VoiceRecorder onRecordSuccess={handleRecordSuccess} />
      </section>

      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Kayıtlar</h2>
            <p className="text-sm text-muted-foreground">
              En yeni sesli notlarınız
            </p>
          </div>
          {!fetchError && (
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {logs.length} kayıt
            </p>
          )}
        </div>

        {fetchError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-4 text-sm text-destructive">
            Kayıtlar yüklenemedi: {fetchError}
          </div>
        )}

        {!fetchError &&
          (logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Henüz kayıt yok. İlk sesli notunuzu yukarıdan ekleyin.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {logs.map((log) => (
                <VoiceCrmLogCard key={log.id} log={log} />
              ))}
            </div>
          ))}
      </section>
    </div>
  );
}
