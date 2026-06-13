"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  CreditCard,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PlanBadge } from "@/components/features/account/RoleBadge";
import { getSubscriptionStatusBadge, METRIC_CARD } from "@/components/features/billing/billing-ui-helpers";
import { Button } from "@/components/ui/button";
import { formatOfficePricingNote, PLAN_CATALOG } from "@/lib/billing/plan-catalog";
import { BILLING_PLANS, type BillablePlan } from "@/lib/billing/plans";
import type { TenantPlanType, TenantStatus } from "@/lib/account/types";
import { cn } from "@/lib/utils";

type BillingViewProps = {
  currentPlan: TenantPlanType;
  currentStatus: TenantStatus;
  embedded?: boolean;
};

const ALL_PLANS: TenantPlanType[] = ["FREE", "PRO", "PREMIUM"];

export function BillingView({
  currentPlan,
  currentStatus,
  embedded = false,
}: BillingViewProps) {
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<BillablePlan | null>(null);
  const checkoutHostRef = useRef<HTMLDivElement>(null);

  const statusBadge = getSubscriptionStatusBadge(currentStatus);
  const currentCatalog = PLAN_CATALOG[currentPlan];

  useEffect(() => {
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");
    const message = searchParams.get("message");

    if (status === "success") {
      toast.success("Abonelik aktif", {
        description: plan
          ? `${plan} paketiniz tanımlandı.`
          : "Ödemeniz onaylandı.",
      });
    } else if (status === "error") {
      toast.error("Ödeme tamamlanamadı", {
        description: message ?? "Lütfen tekrar deneyin.",
      });
    } else if (status === "cancelled") {
      toast.message("Ödeme iptal edildi");
    }
  }, [searchParams]);

  async function startSubscription(plan: BillablePlan) {
    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const payload = (await response.json()) as {
        data?: { checkoutFormContent?: string | null };
        error?: string;
      };

      if (!response.ok || !payload.data?.checkoutFormContent) {
        throw new Error(payload.error ?? "Ödeme formu oluşturulamadı.");
      }

      if (checkoutHostRef.current) {
        checkoutHostRef.current.innerHTML = payload.data.checkoutFormContent;
        const form = checkoutHostRef.current.querySelector("form");
        form?.submit();
      }
    } catch (error) {
      toast.error("Abonelik başlatılamadı", {
        description:
          error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.",
      });
    } finally {
      setLoadingPlan(null);
    }
  }

  const content = (
    <div className={cn("space-y-6", embedded ? "w-full" : "mx-auto w-full max-w-6xl")}>
      {!embedded ? (
        <header className="space-y-3">
          <p className="parsel-section-label text-primary">Hesap & ödeme</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="parsel-page-title text-foreground">Abonelik</h1>
            <PlanBadge plan={currentPlan} />
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Planınızı yönetin, ödeme durumunu takip edin ve ihtiyacınıza göre yükseltin.
          </p>
        </header>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Aktif plan</p>
          <p className="mt-2 text-base font-semibold text-foreground">
            {currentCatalog.marketingName}
          </p>
        </article>
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Aylık ücret</p>
          <p className="parsel-metric-value mt-2 text-parsel-gold">
            {currentCatalog.priceLabel}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">KDV dahil</p>
        </article>
        <article className={METRIC_CARD}>
          <p className="text-[11px] font-medium text-muted-foreground">Abonelik durumu</p>
          <span
            className={cn(
              "mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
              statusBadge.className,
            )}
          >
            {statusBadge.label}
          </span>
        </article>
      </section>

      <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Mevcut abonelik</h2>
                <p className="text-sm text-muted-foreground">{currentCatalog.tagline}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <PlanBadge plan={currentPlan} />
              <span>·</span>
              <span>{currentCatalog.periodLabel}</span>
            </div>
            {currentCatalog.annualNote ? (
              <p className="text-xs font-medium text-primary">{currentCatalog.annualNote}</p>
            ) : null}
          </div>

          <div className="grid gap-2 text-xs text-muted-foreground sm:min-w-[220px]">
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              iyzico güvenli ödeme altyapısı
            </p>
            <p className="inline-flex items-center gap-2">
              <FileText className="size-3.5 shrink-0 text-primary" />
              Fiyatlar KDV dahil gösterilir
            </p>
            <p className="inline-flex items-center gap-2">
              <CreditCard className="size-3.5 shrink-0 text-primary" />
              Paket değişikliği anında yansır
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Plan karşılaştırması</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            İhtiyacınıza uygun paketi seçin; ödeme iyzico üzerinden tamamlanır.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {ALL_PLANS.map((planKey) => {
            const catalog = PLAN_CATALOG[planKey];
            const isCurrent = currentPlan === planKey;
            const isBillable = catalog.billable;
            const billing = isBillable ? BILLING_PLANS[planKey as BillablePlan] : null;

            return (
              <article
                key={planKey}
                className={cn(
                  "parsel-surface relative flex flex-col rounded-2xl border bg-parsel-panel p-5 shadow-parsel-sm sm:p-6",
                  catalog.highlighted
                    ? "border-primary/30"
                    : "border-border/60",
                  isCurrent && "ring-2 ring-primary/20",
                )}
              >
                {catalog.badge ? (
                  <span className="absolute right-4 top-4 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {catalog.badge}
                  </span>
                ) : null}

                {isCurrent ? (
                  <span className="mb-3 inline-flex w-fit rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                    Mevcut planınız
                  </span>
                ) : null}

                <header className="mb-5 border-b border-border/60 pb-5">
                  <p className="parsel-section-label text-muted-foreground">
                    {catalog.marketingName}
                  </p>
                  <p className="mt-3 font-outfit text-3xl font-semibold tracking-tight text-foreground">
                    {catalog.priceLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{catalog.periodLabel}</p>
                  {catalog.annualNote ? (
                    <p className="mt-2 text-xs font-medium text-primary/90">
                      {catalog.annualNote}
                    </p>
                  ) : null}
                  {formatOfficePricingNote(catalog) ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatOfficePricingNote(catalog)}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {billing?.description ?? catalog.tagline}
                  </p>
                </header>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {catalog.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-foreground/90"
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                        strokeWidth={2}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isBillable ? (
                  <Button
                    type="button"
                    disabled={isCurrent || loadingPlan !== null}
                    className={cn(
                      "h-11 w-full",
                      catalog.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border/60 bg-parsel-elevated text-foreground hover:bg-parsel-sunken",
                    )}
                    variant={catalog.highlighted ? "default" : "outline"}
                    onClick={() => startSubscription(planKey as BillablePlan)}
                  >
                    {loadingPlan === planKey ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        iyzico&apos;ya yönlendiriliyor…
                      </>
                    ) : isCurrent ? (
                      "Mevcut paket"
                    ) : (
                      catalog.cta
                    )}
                  </Button>
                ) : (
                  <div className="flex h-11 items-center justify-center rounded-xl border border-dashed border-border/60 bg-parsel-elevated text-sm font-medium text-muted-foreground">
                    {isCurrent ? "Mevcut paket" : "Varsayılan plan"}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="parsel-surface rounded-2xl border border-border/60 bg-parsel-panel px-5 py-4 text-center shadow-parsel-sm sm:px-6">
        <p className="text-sm text-muted-foreground">
          Ödeme altyapısı{" "}
          <span className="font-medium text-foreground">iyzico</span> ile güvence altındadır.
          Tüm fiyatlar KDV dahildir. TTBS onaylı danışman rozeti Danışman ve Ofis paketlerinde
          aktiftir.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Ödeme sonrası fatura bilgileriniz hesap e-postanıza iletilir.
        </p>
      </section>

      <div ref={checkoutHostRef} className="hidden" aria-hidden />
    </div>
  );

  if (embedded) {
    return content;
  }

  return <div className="min-h-full bg-parsel-canvas py-0">{content}</div>;
}
