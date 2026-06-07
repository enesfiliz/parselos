import { NextResponse } from "next/server";

import { planTypeFromPricingReference } from "@/lib/billing/plans";
import { updateTenantSubscriptionState } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";
import type { TenantPlanType, TenantStatus } from "@prisma/client";

type IyzicoWebhookPayload = {
  iyziEventType?: string;
  eventType?: string;
  subscriptionReferenceCode?: string;
  customerReferenceCode?: string;
  pricingPlanReferenceCode?: string;
  subscriptionStatus?: string;
  merchantId?: string;
};

function resolveWebhookEventType(payload: IyzicoWebhookPayload) {
  return (payload.iyziEventType ?? payload.eventType ?? "").toUpperCase();
}

function mapSubscriptionStatus(
  eventType: string,
  subscriptionStatus?: string,
): { planFallback: TenantPlanType | null; status: TenantStatus } {
  const normalizedStatus = subscriptionStatus?.toUpperCase() ?? "";

  if (
    eventType.includes("SUCCESS") ||
    eventType.includes("ACTIVE") ||
    normalizedStatus === "ACTIVE"
  ) {
    return { planFallback: null, status: "ACTIVE" };
  }

  if (
    eventType.includes("CANCEL") ||
    normalizedStatus === "CANCELED" ||
    normalizedStatus === "CANCELLED"
  ) {
    return { planFallback: "FREE", status: "CANCELLED" };
  }

  if (eventType.includes("PAST_DUE") || normalizedStatus === "PAST_DUE") {
    return { planFallback: "FREE", status: "PAST_DUE" };
  }

  return { planFallback: null, status: "PENDING" };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as IyzicoWebhookPayload;
    const eventType = resolveWebhookEventType(payload);

    const subscriptionReference = payload.subscriptionReferenceCode?.trim();
    const pricingPlanReference = payload.pricingPlanReferenceCode?.trim();

    if (!subscriptionReference && !pricingPlanReference) {
      return NextResponse.json({ received: true });
    }

    const lookupFilters = [
      subscriptionReference
        ? { iyzicoSubscriptionReference: subscriptionReference }
        : null,
      pricingPlanReference
        ? { iyzicoPricingPlanReference: pricingPlanReference }
        : null,
    ].filter(Boolean) as Array<
      | { iyzicoSubscriptionReference: string }
      | { iyzicoPricingPlanReference: string }
    >;

    const tenant =
      lookupFilters.length > 0
        ? await prisma.tenant.findFirst({
            where: { OR: lookupFilters },
            orderBy: { guncellenmeTarihi: "desc" },
          })
        : null;

    if (!tenant) {
      console.warn("[iyzico-webhook] tenant not found", payload);
      return NextResponse.json({ received: true });
    }

    const mapped = mapSubscriptionStatus(eventType, payload.subscriptionStatus);
    const planFromPricing = planTypeFromPricingReference(pricingPlanReference);

    const nextPlan =
      mapped.planFallback ??
      planFromPricing ??
      (mapped.status === "ACTIVE" ? tenant.planType : "FREE");

    await updateTenantSubscriptionState({
      tenantId: tenant.id,
      planType: nextPlan,
      status: mapped.status,
      iyzicoSubscriptionReference: subscriptionReference ?? tenant.iyzicoSubscriptionReference,
      iyzicoPricingPlanReference:
        pricingPlanReference ?? tenant.iyzicoPricingPlanReference,
      iyzicoCustomerReference:
        payload.customerReferenceCode ?? tenant.iyzicoCustomerReference,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[POST /api/webhooks/iyzico]", error);
    return NextResponse.json({ error: "Webhook işlenemedi." }, { status: 500 });
  }
}
