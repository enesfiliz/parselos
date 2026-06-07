"use client";

import { useMemo, useState } from "react";
import { KeyRound, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AdminAiToggle } from "@/components/admin/AdminAiToggle";
import { Button } from "@/components/ui/button";
import {
  AI_COST_METRICS,
  AI_MODEL_OPTIONS,
  AI_TOOL_TOGGLES,
  DEFAULT_ACTIVE_MODEL_ID,
  DEFAULT_SYSTEM_PROMPT,
  MOCK_MASKED_API_KEY,
  getActiveModelStatusLabel,
  type AiToolToggle,
} from "@/lib/admin/mock-ai-settings";
import { cn } from "@/lib/utils";

export function AdminAiSettingsView() {
  const [activeModelId, setActiveModelId] = useState(DEFAULT_ACTIVE_MODEL_ID);
  const [apiKey, setApiKey] = useState(MOCK_MASKED_API_KEY);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [tools, setTools] = useState<AiToolToggle[]>(AI_TOOL_TOGGLES);

  const engineStatus = useMemo(
    () => getActiveModelStatusLabel(activeModelId),
    [activeModelId],
  );

  function handleToolToggle(toolId: string, enabled: boolean) {
    setTools((current) =>
      current.map((tool) =>
        tool.id === toolId && !tool.maintenance ? { ...tool, enabled } : tool,
      ),
    );

    const tool = tools.find((item) => item.id === toolId);
    if (tool?.maintenance) {
      toast.warning("Bakım modu", {
        description: `${tool.label} şu an devre dışı.`,
      });
      return;
    }

    toast.message("Yetenek güncellendi", {
      description: enabled
        ? `${tool?.label} etkinleştirildi.`
        : `${tool?.label} kapatıldı.`,
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
            God Mode · AI Motoru
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Parsel AI Motor Kontrolü
          </h1>
          <p className="text-sm text-foreground0">
            Model, prompt ve yetenekleri kod değiştirmeden yönetin.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 self-start rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-200">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          <span>
            AI Engine: <span className="font-medium text-emerald-100">Aktif</span>{" "}
            ({engineStatus})
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <article className="rounded-2xl border border-border/50 bg-parsel-elevated p-6 xl:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-400" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-foreground">
              Motor ve API Konfigürasyonu
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="active-model"
                className="text-xs font-medium uppercase tracking-[0.14em] text-foreground0"
              >
                Aktif Model
              </label>
              <select
                id="active-model"
                value={activeModelId}
                onChange={(event) => {
                  setActiveModelId(event.target.value);
                  toast.message("Model seçildi", {
                    description: `${AI_MODEL_OPTIONS.find((m) => m.id === event.target.value)?.label} — kaydetmek için motor ayarlarını güncelleyin.`,
                  });
                }}
                className="h-11 w-full rounded-lg border border-border bg-white/[0.02] px-3 text-sm text-foreground focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              >
                {AI_MODEL_OPTIONS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-parsel-elevated">
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="api-key"
                className="text-xs font-medium uppercase tracking-[0.14em] text-foreground0"
              >
                API Key
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-white/[0.02] px-4 font-mono text-sm text-foreground/90 focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                  autoComplete="off"
                  spellCheck={false}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 border-emerald-500/20 bg-emerald-500/5 text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100"
                  onClick={() => {
                    toast.success("API anahtarı güncellendi", {
                      description: "Yeni key güvenli kasada şifrelendi (simülasyon).",
                    });
                  }}
                >
                  <KeyRound className="size-4" strokeWidth={1.75} />
                  Key Güncelle
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Groq, OpenAI veya Anthropic anahtarları buradan rotalanır.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border/50 bg-parsel-elevated p-6 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Global System Prompt Editörü
            </h2>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-300/90">
              Canlı Beyin
            </span>
          </div>

          <textarea
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            rows={14}
            spellCheck={false}
            className="custom-scrollbar min-h-[280px] w-full resize-y rounded-xl border border-border bg-[#111] p-4 font-mono text-sm leading-relaxed text-emerald-400/90 focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 xl:min-h-[320px]"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {systemPrompt.length.toLocaleString("tr-TR")} karakter · tüm oturumlara
              anında yansır
            </p>
            <Button
              type="button"
              className="bg-emerald-600 text-foreground hover:bg-emerald-500"
              onClick={() => {
                toast.success("System prompt kaydedildi", {
                  description: "Parsel AI karakteri ve kuralları güncellendi.",
                });
              }}
            >
              <Save className="size-4" strokeWidth={1.75} />
              Karakteri ve Kuralları Kaydet
            </Button>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-border/50 bg-parsel-elevated p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-foreground">Yetenek Yönetimi</h2>
          <p className="mt-1 text-xs text-foreground0">
            Copilot araçlarını ofis genelinde açıp kapatın.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
                tool.maintenance
                  ? "border-red-500/15 bg-red-500/[0.03]"
                  : tool.enabled
                    ? "border-emerald-500/15 bg-emerald-500/[0.03]"
                    : "border-border/50 bg-white/[0.02]",
              )}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span aria-hidden>{tool.emoji}</span>
                  {tool.label}
                  {tool.maintenance ? (
                    <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-300">
                      Bakımda
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        tool.enabled
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-600/40 bg-border/40 text-foreground0",
                      )}
                    >
                      {tool.enabled ? "Aktif" : "Pasif"}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-foreground0">{tool.description}</p>
              </div>

              <AdminAiToggle
                checked={tool.enabled}
                disabled={tool.maintenance}
                label={tool.label}
                onChange={(enabled) => handleToolToggle(tool.id, enabled)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-foreground">
            Maliyet ve Token Monitörü
          </h2>
          <p className="mt-1 text-xs text-foreground0">
            Mayıs 2026 dönemi · tüm kiracılar
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {AI_COST_METRICS.map((metric) => (
            <div
              key={metric.id}
              className="rounded-xl border border-border/50 bg-white/[0.02] px-4 py-4"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground0">
                {metric.label}
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                {metric.value}
              </p>
              {metric.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
