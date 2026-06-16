"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { ParselAiGlyph } from "@/components/copilot/ParselAiGlyph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildRecommendedQuickActions,
  EMPTY_PARSEL_AI_PROFILE,
  labelForPrimaryGoal,
  labelForTone,
  labelForWorkType,
  labelsForCustomerTypes,
  labelsForDailyUse,
  labelsForPortfolioFocus,
  PARSEL_AI_CUSTOMER_TYPE_OPTIONS,
  PARSEL_AI_DAILY_USE_OPTIONS,
  PARSEL_AI_PORTFOLIO_FOCUS_OPTIONS,
  PARSEL_AI_PRIMARY_GOAL_OPTIONS,
  PARSEL_AI_TONE_OPTIONS,
  PARSEL_AI_WORK_TYPE_OPTIONS,
  type ParselAiProfile,
} from "@/lib/copilot/parsel-ai-profile";
import { cn } from "@/lib/utils";

const STEPS = [
  "workType",
  "region",
  "portfolioFocus",
  "customerTypes",
  "primaryGoal",
  "tone",
  "dailyUse",
  "summary",
] as const;

type ParselAiOnboardingProps = {
  initialProfile?: ParselAiProfile;
  onComplete: (profile: ParselAiProfile) => void;
  onSkip?: () => void;
};

function toggleArrayValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function SelectionCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3 text-left transition-colors",
        selected
          ? "border-primary/35 bg-primary/10"
          : "border-border/60 bg-parsel-elevated hover:border-primary/20 hover:bg-parsel-panel",
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-parsel-elevated px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

export function ParselAiOnboarding({
  initialProfile,
  onComplete,
  onSkip,
}: ParselAiOnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<ParselAiProfile>(
    initialProfile ?? { ...EMPTY_PARSEL_AI_PROFILE },
  );

  const step = STEPS[stepIndex]!;
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);
  const recommendedActions = useMemo(
    () => buildRecommendedQuickActions(draft),
    [draft],
  );

  function canContinue() {
    switch (step) {
      case "workType":
        return Boolean(draft.workType);
      case "region":
        return draft.region.trim().length >= 2;
      case "portfolioFocus":
        return draft.portfolioFocus.length > 0;
      case "customerTypes":
        return draft.customerTypes.length > 0;
      case "primaryGoal":
        return Boolean(draft.primaryGoal);
      case "tone":
        return Boolean(draft.tone);
      case "dailyUse":
        return draft.dailyUse.length > 0;
      case "summary":
        return true;
      default:
        return false;
    }
  }

  function handleNext() {
    if (step === "summary") {
      onComplete({
        ...draft,
        onboardingCompleted: true,
        completedAt: new Date().toISOString(),
      });
      return;
    }

    if (!canContinue()) return;
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-4">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <ParselAiGlyph size="md" />
        </div>
        <h2 className="font-outfit text-xl font-semibold text-foreground">
          ParselAI&apos;ı özelleştirelim
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
          Birkaç kısa seçimle asistanı çalışma tarzınıza göre ayarlayın. Bu
          tercihleri daha sonra panelden yeniden düzenleyebilirsiniz.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Adım {stepIndex + 1} / {STEPS.length}
          </span>
          <span>%{progress}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-parsel-sunken">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {step === "workType" ? (
          <>
            <h3 className="text-sm font-semibold text-foreground">Çalışma tipiniz</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {PARSEL_AI_WORK_TYPE_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.value}
                  selected={draft.workType === option.value}
                  title={option.label}
                  description={option.description}
                  onClick={() =>
                    setDraft((current) => ({ ...current, workType: option.value }))
                  }
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "region" ? (
          <>
            <h3 className="text-sm font-semibold text-foreground">
              Uzmanlık bölgeniz
            </h3>
            <p className="text-sm text-muted-foreground">
              İl, ilçe veya bölge yazın. Örn: Kocaeli / Gölcük
            </p>
            <Input
              value={draft.region}
              onChange={(event) =>
                setDraft((current) => ({ ...current, region: event.target.value }))
              }
              placeholder="Kocaeli, Gölcük"
              className="bg-parsel-elevated"
            />
          </>
        ) : null}

        {step === "portfolioFocus" ? (
          <>
            <h3 className="text-sm font-semibold text-foreground">Portföy odağınız</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {PARSEL_AI_PORTFOLIO_FOCUS_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.value}
                  selected={draft.portfolioFocus.includes(option.value)}
                  title={option.label}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      portfolioFocus: toggleArrayValue(
                        current.portfolioFocus,
                        option.value,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "customerTypes" ? (
          <>
            <h3 className="text-sm font-semibold text-foreground">
              Çalıştığınız müşteri tipleri
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {PARSEL_AI_CUSTOMER_TYPE_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.value}
                  selected={draft.customerTypes.includes(option.value)}
                  title={option.label}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      customerTypes: toggleArrayValue(
                        current.customerTypes,
                        option.value,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "primaryGoal" ? (
          <>
            <h3 className="text-sm font-semibold text-foreground">Öncelikli hedefiniz</h3>
            <div className="grid gap-2">
              {PARSEL_AI_PRIMARY_GOAL_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.value}
                  selected={draft.primaryGoal === option.value}
                  title={option.label}
                  description={option.description}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      primaryGoal: option.value,
                    }))
                  }
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "tone" ? (
          <>
            <h3 className="text-sm font-semibold text-foreground">Cevap tonu</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {PARSEL_AI_TONE_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.value}
                  selected={draft.tone === option.value}
                  title={option.label}
                  description={option.description}
                  onClick={() =>
                    setDraft((current) => ({ ...current, tone: option.value }))
                  }
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "dailyUse" ? (
          <>
            <h3 className="text-sm font-semibold text-foreground">Günlük kullanım</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {PARSEL_AI_DAILY_USE_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.value}
                  selected={draft.dailyUse.includes(option.value)}
                  title={option.label}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      dailyUse: toggleArrayValue(current.dailyUse, option.value),
                    }))
                  }
                />
              ))}
            </div>
          </>
        ) : null}

        {step === "summary" ? (
          <>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <p className="text-sm font-semibold">Senin ParselAI profilin</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Bu tercihleri daha sonra ayarlardan değiştirebilirsin.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryRow label="Çalışma tipi" value={labelForWorkType(draft.workType)} />
              <SummaryRow label="Bölge" value={draft.region || "—"} />
              <SummaryRow
                label="Portföy odağı"
                value={labelsForPortfolioFocus(draft.portfolioFocus)}
              />
              <SummaryRow
                label="Müşteri tipi"
                value={labelsForCustomerTypes(draft.customerTypes)}
              />
              <SummaryRow
                label="Öncelikli hedef"
                value={labelForPrimaryGoal(draft.primaryGoal)}
              />
              <SummaryRow label="Cevap tonu" value={labelForTone(draft.tone)} />
              <SummaryRow
                label="Günlük kullanım"
                value={labelsForDailyUse(draft.dailyUse)}
              />
            </div>
            <div className="rounded-xl border border-border/60 bg-parsel-elevated px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Önerilen hızlı aksiyonlar
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                {recommendedActions.map((action) => (
                  <li key={action.label} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    {action.label}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {stepIndex > 0 ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 size-4" />
              Geri
            </Button>
          ) : onSkip ? (
            <Button type="button" variant="ghost" onClick={onSkip}>
              Şimdilik atla
            </Button>
          ) : null}
        </div>
        <Button type="button" onClick={handleNext} disabled={!canContinue()}>
          {step === "summary" ? "ParselAI'ı başlat" : "Devam"}
          {step !== "summary" ? <ArrowRight className="ml-2 size-4" /> : null}
        </Button>
      </div>
    </div>
  );
}
