import { NextResponse } from "next/server";

import { planTypeFromPricingReference } from "@/lib/billing/plans";
import { updateTenantSubscriptionState } from "@/lib/billing/tenant";
import { retrieveCheckoutFormSubscription } from "@/lib/iyzico/subscription";
import { prisma } from "@/lib/prisma";

function billingRedirectUrl(request: Request, params: Record<string, string>) {
  const url = new URL("/billing", request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token") ?? "").trim();

    if (!token) {
      return billingRedirectUrl(request, {
        status: "error",
        message: "Ödeme tokenı alınamadı.",
      });
    }

    const detail = await retrieveCheckoutFormSubscription(token);
    const planType =
      planTypeFromPricingReference(detail.pricingPlanReferenceCode) ?? "PRO";

    const tenant = detail.subscriptionReferenceCode
      ? await prisma.tenant.findFirst({
          where: {
            OR: [
              { iyzicoSubscriptionReference: detail.subscriptionReferenceCode },
              { status: "PENDING" },
            ],
          },
          orderBy: { guncellenmeTarihi: "desc" },
        })
      : await prisma.tenant.findFirst({
          where: { status: "PENDING" },
          orderBy: { guncellenmeTarihi: "desc" },
        });

    if (!tenant) {
      return billingRedirectUrl(request, {
        status: "error",
        message: "Kiracı eşlemesi bulunamadı.",
      });
    }

    const isActive =
      detail.subscriptionStatus?.toUpperCase() === "ACTIVE" ||
      detail.subscriptionStatus?.toUpperCase() === "UPGRADED";

    await updateTenantSubscriptionState({
      tenantId: tenant.id,
      planType: isActive ? planType : "FREE",
      status: isActive ? "ACTIVE" : "PAST_DUE",
      iyzicoSubscriptionReference: detail.subscriptionReferenceCode ?? null,
      iyzicoPricingPlanReference: detail.pricingPlanReferenceCode ?? null,
      iyzicoCustomerReference: detail.customerReferenceCode ?? null,
    });

    return billingRedirectUrl(request, {
      status: isActive ? "success" : "pending",
      plan: planType,
    });
  } catch (error) {
    console.error("[POST /api/billing/callback]", error);
    return billingRedirectUrl(request, {
      status: "error",
      message: "Ödeme doğrulanamadı.",
    });
  }
}

export async function GET(request: Request) {
  return billingRedirectUrl(request, {
    status: "cancelled",
    message: "Ödeme işlemi iptal edildi.",
  });
}
