"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PlanBadge } from "@/components/features/account/RoleBadge";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/lib/account/labels";
import type { TenantPlanType, TenantStatus } from "@/lib/account/types";
import { formatOfficePricingNote, PLAN_CATALOG } from "@/lib/billing/plan-catalog";
import { BILLING_PLANS, type BillablePlan } from "@/lib/billing/plans";
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

  return (
    <div className={cn("space-y-8", embedded ? "w-full" : "mx-auto max-w-6xl")}>
      <div
        className={cn(
          "rounded-2xl border border-border bg-card px-5 py-4",
          embedded ? "shadow-sm" : "",
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Aktif plan</span>
          <PlanBadge plan={currentPlan} />
          <span className="text-sm text-muted-foreground">
            · {STATUS_LABELS[currentStatus]}
          </span>
        </div>
        {!embedded ? (
          <p className="mt-2 text-sm text-muted-foreground">
            KDV dahil aylık fiyatlar. İstediğiniz zaman paket değiştirebilirsiniz.
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {ALL_PLANS.map((planKey) => {
          const catalog = PLAN_CATALOG[planKey];
          const isCurrent = currentPlan === planKey;
          const isBillable = catalog.billable;
          const billing = isBillable ? BILLING_PLANS[planKey as BillablePlan] : null;

          return (
            <article
              key={planKey}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6",
                catalog.highlighted
                  ? "border-primary/35 shadow-[0_0_0_1px_rgba(122,159,69,0.15)]"
                  : "border-border",
                isCurrent && "ring-2 ring-primary/25",
              )}
            >
              {catalog.badge ? (
                <span className="absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {catalog.badge}
                </span>
              ) : null}

              <header className="mb-5 border-b border-border/60 pb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                    className="flex items-start gap-2.5 text-sm text-foreground/85"
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
                      : "bg-muted text-foreground hover:bg-muted/80",
                  )}
                  onClick={() => startSubscription(planKey as BillablePlan)}
                >
                  {loadingPlan === planKey ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Yönlendiriliyor...
                    </>
                  ) : isCurrent ? (
                    "Mevcut Paket"
                  ) : (
                    catalog.cta
                  )}
                </Button>
              ) : (
                <div className="flex h-11 items-center justify-center rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground">
                  {isCurrent ? "Mevcut Paket" : "Varsayılan plan"}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Ödeme altyapısı Iyzico ile güvence altındadır. TTBS onaylı danışman rozeti
        Danışman ve Ofis paketlerinde aktiftir.
      </p>

      <div ref={checkoutHostRef} className="hidden" aria-hidden />
    </div>
  );
}
