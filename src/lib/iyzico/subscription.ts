import "server-only";

import type { BillablePlan } from "@/lib/billing/plans";
import { pricingPlanReferenceFor } from "@/lib/billing/plans";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { iyzicoRequest } from "@/lib/iyzico/client";
import { prisma } from "@/lib/prisma";

type CreateSubscriptionInput = {
  tenantId: string;
  agentId: string;
  plan: BillablePlan;
  callbackUrl: string;
  customer: {
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    identityNumber: string;
    city?: string;
    country?: string;
    address?: string;
    zipCode?: string;
  };
};

type CheckoutInitializeResponse = {
  token?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
};

export async function createSubscription(input: CreateSubscriptionInput) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: input.tenantId },
    include: {
      agents: {
        where: { id: input.agentId },
        take: 1,
      },
    },
  });

  if (!tenant || tenant.agents.length === 0) {
    throw new Error("Kiracı bulunamadı veya bu danışmana ait değil.");
  }

  const pricingPlanReferenceCode = pricingPlanReferenceFor(input.plan);

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      planType: input.plan,
      status: "PENDING",
      iyzicoPricingPlanReference: pricingPlanReferenceCode,
    },
  });

  const payload = {
    locale: "tr",
    conversationId: `${tenant.id}-${Date.now()}`,
    callbackUrl: input.callbackUrl,
    pricingPlanReferenceCode,
    subscriptionInitialStatus: "ACTIVE",
    customer: {
      name: input.customer.name,
      surname: input.customer.surname,
      email: input.customer.email,
      gsmNumber: input.customer.gsmNumber,
      identityNumber: input.customer.identityNumber,
      billingAddress: {
        contactName: `${input.customer.name} ${input.customer.surname}`.trim(),
        city: input.customer.city ?? "Istanbul",
        country: input.customer.country ?? "Turkey",
        address: input.customer.address ?? "Turkey",
        zipCode: input.customer.zipCode ?? "34000",
      },
      shippingAddress: {
        contactName: `${input.customer.name} ${input.customer.surname}`.trim(),
        city: input.customer.city ?? "Istanbul",
        country: input.customer.country ?? "Turkey",
        address: input.customer.address ?? "Turkey",
        zipCode: input.customer.zipCode ?? "34000",
      },
    },
  };

  const result = await iyzicoRequest<CheckoutInitializeResponse>(
    "/v2/subscription/checkoutform/initialize",
    payload,
  );

  return {
    tenantId: tenant.id,
    plan: input.plan,
    token: result.token ?? null,
    checkoutFormContent: result.checkoutFormContent ?? null,
    tokenExpireTime: result.tokenExpireTime ?? null,
  };
}

export async function createSubscriptionForAgent(
  agentId: string,
  plan: BillablePlan,
  callbackUrl: string,
  customer?: Partial<CreateSubscriptionInput["customer"]>,
) {
  const { agent, tenant } = await getOrCreateTenantForAgent(agentId);

  const name = customer?.name?.trim() || agent.firstName?.trim() || "Parsel";
  const surname = customer?.surname?.trim() || agent.lastName?.trim() || "Danışman";
  const email = customer?.email?.trim() || agent.email?.trim();

  if (!email) {
    throw new Error("Abonelik için e-posta adresi gerekli.");
  }

  return createSubscription({
    tenantId: tenant.id,
    agentId: agent.id,
    plan,
    callbackUrl,
    customer: {
      name,
      surname,
      email,
      gsmNumber: customer?.gsmNumber?.trim() || "+905350000000",
      identityNumber: customer?.identityNumber?.trim() || "11111111111",
      city: customer?.city,
      country: customer?.country,
      address: customer?.address,
      zipCode: customer?.zipCode,
    },
  });
}

export async function retrieveCheckoutFormSubscription(token: string) {
  return iyzicoRequest<{
    subscriptionReferenceCode?: string;
    customerReferenceCode?: string;
    pricingPlanReferenceCode?: string;
    subscriptionStatus?: string;
  }>("/v2/subscription/checkoutform/auth/ecom/detail", { token });
}
