"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { assertCanCreatePortfolio } from "@/lib/billing/enforce-limits";
import { getTenantPlanForClerkUser } from "@/lib/billing/tenant";
import { findOrCreateClient } from "@/lib/deals/find-or-create-client";
import { findAuthorizedPropertyForAgent } from "@/lib/portfolios/portfolio-access";
import {
  PROPERTY_SHARED_DELETE_ERROR,
  PROPERTY_SHARED_MUTATION_ERROR,
  resolvePropertyMutationAccess,
} from "@/lib/properties/ownership";
import {
  mapPropertyToPortfolio,
  parseLocationInput,
  parsePriceTL,
} from "@/lib/portfolios/portfolio-mapper";
import type { PortfolioFormValues } from "@/lib/portfolios/portfolio-form";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { prisma } from "@/lib/prisma";
import { DEFAULT_DEAL_TASKS } from "@/lib/types/deal";

const PORTFOLIOS_PATH = "/portfolios";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function buildPropertyData(values: PortfolioFormValues) {
  const location = parseLocationInput(values.location);
  const sqm = values.sqm ? Number(values.sqm) : null;

  return {
    ilanBasligi: values.title.trim(),
    fiyat: parsePriceTL(values.price),
    il: location.il,
    ilce: location.ilce,
    mahalle: location.mahalle,
    metrekare: Number.isNaN(sqm) ? null : sqm,
    odaSayisi: values.rooms.trim() || null,
    aciklama: values.description.trim() || null,
    binaYasi: values.buildingAge.trim() || null,
    kapakGorseli: values.coverImageUrl.trim() || null,
    durum: values.listingType,
    tur: "YETKILI" as const,
  };
}

export async function createPortfolioAction(
  values: PortfolioFormValues,
): Promise<ActionResult<AuthorizedPortfolioItem>> {
  try {
    const agent = await requireCurrentAgent();
    const { planType } = await getTenantPlanForClerkUser(agent.clerkUserId);
    await assertCanCreatePortfolio(planType);

    const propertyData = buildPropertyData(values);

    const ownerName = values.ownerName.trim() || "Mal Sahibi";
    const client = await findOrCreateClient({
      adSoyad: ownerName,
      telefon: values.ownerPhone.trim() || null,
      kaynak: "Portföy Vitrini",
    });

    const property = await prisma.property.create({
      data: propertyData,
    });

    await prisma.deal.create({
      data: {
        clientId: client.id,
        propertyId: property.id,
        agentId: agent.id,
        stage: "LEAD",
        sonIletisim: "Bugün",
        tasks: DEFAULT_DEAL_TASKS,
      },
    });

    const saved = await findAuthorizedPropertyForAgent(agent.id, property.id);
    if (!saved) {
      return { success: false, error: "Oluşturulan portföy okunamadı." };
    }

    revalidatePath(PORTFOLIOS_PATH);
    return { success: true, data: mapPropertyToPortfolio(saved) };
  } catch (error) {
    console.error("[createPortfolioAction]", error);
    return { success: false, error: "Portföy oluşturulurken bir hata oluştu." };
  }
}

export async function updatePortfolioAction(
  propertyId: string,
  values: PortfolioFormValues,
): Promise<ActionResult<AuthorizedPortfolioItem>> {
  try {
    if (!propertyId.trim()) {
      return { success: false, error: "Geçersiz portföy kimliği." };
    }

    const agent = await requireCurrentAgent();
    const access = await resolvePropertyMutationAccess(propertyId, agent.id);

    if (!access.exists || !access.ownedByAgent) {
      return { success: false, error: "Portföy bulunamadı veya erişim yok." };
    }

    if (!access.canMutate) {
      return { success: false, error: PROPERTY_SHARED_MUTATION_ERROR };
    }

    const existing = await findAuthorizedPropertyForAgent(agent.id, propertyId);

    if (!existing) {
      return { success: false, error: "Portföy bulunamadı veya erişim yok." };
    }

    const propertyData = buildPropertyData(values);
    const primaryDeal = existing.deals[0];

    if (!primaryDeal) {
      return {
        success: false,
        error: "Portföy kaydı güncellenemiyor: danışman bağlantısı bulunamadı.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: propertyData,
      });

      await tx.client.update({
        where: { id: primaryDeal.client.id },
        data: {
          adSoyad: values.ownerName.trim() || primaryDeal.client.adSoyad,
          telefon: values.ownerPhone.trim() || primaryDeal.client.telefon,
        },
      });
    });

    const saved = await findAuthorizedPropertyForAgent(agent.id, propertyId);
    if (!saved) {
      return { success: false, error: "Güncellenen portföy okunamadı." };
    }

    revalidatePath(PORTFOLIOS_PATH);
    revalidatePath(`${PORTFOLIOS_PATH}/${propertyId}`);
    return { success: true, data: mapPropertyToPortfolio(saved) };
  } catch (error) {
    console.error("[updatePortfolioAction]", error);
    return {
      success: false,
      error: "Portföy güncellenirken bir hata oluştu.",
    };
  }
}

export async function deletePortfolioAction(
  propertyId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!propertyId.trim()) {
      return { success: false, error: "Geçersiz portföy kimliği." };
    }

    const agent = await requireCurrentAgent();
    const access = await resolvePropertyMutationAccess(propertyId, agent.id);

    if (!access.exists || !access.ownedByAgent) {
      return { success: false, error: "Portföy bulunamadı veya erişim yok." };
    }

    if (!access.canMutate) {
      return { success: false, error: PROPERTY_SHARED_DELETE_ERROR };
    }

    const existing = await findAuthorizedPropertyForAgent(agent.id, propertyId);

    if (!existing) {
      return { success: false, error: "Portföy bulunamadı veya erişim yok." };
    }

    await prisma.property.delete({ where: { id: propertyId } });

    revalidatePath(PORTFOLIOS_PATH);
    return { success: true, data: { id: propertyId } };
  } catch (error) {
    console.error("[deletePortfolioAction]", error);
    return { success: false, error: "Portföy silinirken bir hata oluştu." };
  }
}
