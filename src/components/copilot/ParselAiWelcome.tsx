"use client";

import { ShieldCheck, Sparkles } from "lucide-react";

import { ParselAiGlyph } from "@/components/copilot/ParselAiGlyph";
import {
  buildRecommendedQuickActions,
  labelForPrimaryGoal,
  labelForWorkType,
  labelsForPortfolioFocus,
  type ParselAiProfile,
} from "@/lib/copilot/parsel-ai-profile";
import {
  COPILOT_QUICK_PROMPTS,
  COPILOT_TRUST_NOTE,
} from "@/lib/copilot/quick-prompts";
import { cn } from "@/lib/utils";

type ParselAiWelcomeProps = {
  profile: ParselAiProfile;
  disabled: boolean;
  onPick: (prompt: string) => void;
  onEditProfile: () => void;
};

export function ParselAiWelcome({
  profile,
  disabled,
  onPick,
  onEditProfile,
}: ParselAiWelcomeProps) {
  const recommended = buildRecommendedQuickActions(profile);
  const displayActions = profile.onboardingCompleted
    ? recommended
    : COPILOT_QUICK_PROMPTS.slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-4">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-parsel-panel via-parsel-elevated to-primary/5 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <ParselAiGlyph size="md" />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="parsel-section-label text-primary">ParselOS Intelligence</p>
            <h2 className="font-outfit text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
              ParselAI — Emlak operasyon asistanın
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Müşteri, portföy, imar, saha notu ve takip süreçlerini tek akışta
              yorumlar.
            </p>
          </div>
        </div>
      </div>

      {profile.onboardingCompleted ? (
        <div className="rounded-2xl border border-border/60 bg-parsel-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-primary" />
                Senin ParselAI profilin
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {labelForWorkType(profile.workType)} · {profile.region || "Bölge belirtilmedi"}
              </p>
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              className="text-xs font-medium text-primary hover:underline"
            >
              Profili düzenle
            </button>
          </div>
          <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <span>Portföy: {labelsForPortfolioFocus(profile.portfolioFocus)}</span>
            <span>Hedef: {labelForPrimaryGoal(profile.primaryGoal)}</span>
            <span>Önerilen aksiyonlar kişiselleştirildi</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {displayActions.map((chip) => (
          <button
            key={chip.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(chip.prompt)}
            className={cn(
              "rounded-xl border px-4 py-4 text-left transition-colors",
              "border-border/60 bg-parsel-panel hover:border-primary/25 hover:bg-primary/5",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Hızlı aksiyon
            </span>
            <span className="mt-1 block text-sm font-medium text-foreground">
              {chip.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-parsel-elevated px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>{COPILOT_TRUST_NOTE}</p>
      </div>
    </div>
  );
}
