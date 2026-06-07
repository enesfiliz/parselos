"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BILLING_PLANS, type BillablePlan } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

type BillingViewProps = {
  currentPlan: "FREE" | "PRO" | "PREMIUM";
  currentStatus: string;
};

export function BillingView({ currentPlan, currentStatus }: BillingViewProps) {
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
          ? `${plan} paketiniz başarıyla tanımlandı.`
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
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-parsel-gold/70">
          Abonelik
        </p>
        <h1 className="font-outfit text-2xl font-semibold tracking-tight text-foreground/90 md:text-3xl">
          Paketi Yükselt
        </h1>
        <p className="text-sm text-foreground/45">
          Mevcut plan:{" "}
          <span className="font-medium text-foreground/75">{currentPlan}</span> · Durum:{" "}
          <span className="font-medium text-foreground/75">{currentStatus}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {(Object.keys(BILLING_PLANS) as BillablePlan[]).map((planKey) => {
          const plan = BILLING_PLANS[planKey];
          const isCurrent = currentPlan === planKey;

          return (
            <article
              key={planKey}
              className={cn(
                "rounded-2xl border bg-parsel-admin p-6 transition-colors",
                planKey === "PREMIUM"
                  ? "border-[#b38c56]/30 shadow-[0_0_40px_rgba(179,140,86,0.08)]"
                  : "border-border/60",
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-foreground/90">{plan.label}</h2>
                  <p className="mt-1 text-sm text-foreground/45">{plan.description}</p>
                </div>
                {planKey === "PREMIUM" ? (
                  <Sparkles className="size-5 text-parsel-gold" strokeWidth={1.5} />
                ) : null}
              </div>

              <p className="font-inter text-3xl font-medium tracking-tight text-foreground">
                {plan.priceLabel}
              </p>

              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-3.5 shrink-0 text-parsel-gold" strokeWidth={2} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                disabled={isCurrent || loadingPlan !== null}
                className={cn(
                  "mt-6 h-11 w-full",
                  planKey === "PREMIUM"
                    ? "bg-parsel-gold text-black hover:bg-[#c49a62]"
                    : "bg-foreground/10 text-foreground hover:bg-white/15",
                )}
                onClick={() => startSubscription(planKey)}
              >
                {loadingPlan === planKey ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Iyzico&apos;ya yönlendiriliyor...
                  </>
                ) : isCurrent ? (
                  "Aktif Paket"
                ) : (
                  `${plan.label} Paketine Geç`
                )}
              </Button>
            </article>
          );
        })}
      </div>

      <div ref={checkoutHostRef} className="hidden" aria-hidden />
    </div>
  );
}
