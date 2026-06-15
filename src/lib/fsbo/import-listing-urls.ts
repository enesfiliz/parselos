import "server-only";

import {
  assertCanCreatePortfolio,
  assertCanImportListing,
} from "@/lib/billing/enforce-limits";
import { agentOwnershipFilter } from "@/lib/auth/agent";
import { findOrCreateClient } from "@/lib/deals/find-or-create-client";
import { parsePriceToInteger } from "@/lib/fsbo/price-parser";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { parseLocationInput } from "@/lib/portfolios/portfolio-mapper";
import {
  isSupportedListingUrl,
  scrapeListingUrl,
} from "@/lib/scrape/listing-scraper";
import { prisma } from "@/lib/prisma";
import type { TenantPlanType } from "@/lib/account/types";
import { DEFAULT_DEAL_TASKS } from "@/lib/types/deal";

export type ImportListingInput = {
  url: string;
  title?: string;
  price?: string | number;
  location?: string;
  m2?: string | number;
  imageUrl?: string;
};

export type ImportListingResult = {
  url: string;
  success: boolean;
  error?: string;
  mocked?: boolean;
  leadId?: string;
  portfolioId?: string;
};

function parseLocationParts(location: string) {
  const parts = location
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { il: parts[parts.length - 1], ilce: parts[0], region: location };
  }
  return { il: null, ilce: parts[0] ?? null, region: location || "Türkiye" };
}

async function createPortfolioFromScraped(
  agentId: string,
  scraped: {
    title: string;
    price: number;
    location: string;
    m2?: string;
    url: string;
    images?: string[];
  },
  planType: TenantPlanType,
) {
  await assertCanCreatePortfolio(planType);

  const loc = parseLocationInput(scraped.location);
  const sqm = scraped.m2 ? parseInt(scraped.m2.replace(/\D/g, ""), 10) : null;

  const client = await findOrCreateClient({
    adSoyad: "Mal Sahibi",
    kaynak: "İlan Linki",
  });

  const cover =
    scraped.images && scraped.images.length > 0 ? scraped.images[0] : null;

  const property = await prisma.property.create({
    data: {
      ilanBasligi: scraped.title,
      fiyat: scraped.price,
      il: loc.il,
      ilce: loc.ilce,
      mahalle: loc.mahalle,
      metrekare: sqm && !Number.isNaN(sqm) ? sqm : null,
      aciklama: `Kaynak: ${scraped.url}`,
      kapakGorseli: cover,
      durum: "SATILIK",
      tur: "YETKILI",
    },
  });

  await prisma.deal.create({
    data: {
      clientId: client.id,
      propertyId: property.id,
      agentId,
      stage: "LEAD",
      listingUrl: scraped.url,
      sonIletisim: "Bugün",
      tasks: DEFAULT_DEAL_TASKS,
    },
  });

  return property.id;
}

export async function importListingItemsForAgent(
  items: ImportListingInput[],
  agentId: string,
  planType: TenantPlanType,
  options?: { addToPortfolio?: boolean },
): Promise<{ results: ImportListingResult[]; imported: number }> {
  await assertCanImportListing(planType, agentId, items.length);

  const results: ImportListingResult[] = [];
  let imported = 0;

  for (const item of items) {
    const url = item.url.trim();
    if (!url) continue;

    if (!isSupportedListingUrl(url)) {
      results.push({
        url,
        success: false,
        error: "Desteklenen kaynak: Sahibinden, Emlakjet, Hepsiemlak.",
      });
      continue;
    }

    try {
      const scraped = await scrapeListingUrl(url, {
        allowMock: false,
        manual: {
          title: item.title,
          price: item.price,
          location: item.location,
          m2: item.m2,
          imageUrl: item.imageUrl,
        },
      });

      const price = parsePriceToInteger(scraped.price) ?? 0;
      const loc = parseLocationParts(scraped.location);

      if (price <= 0) {
        results.push({
          url,
          success: false,
          error: "Fiyat okunamadı. Manuel fiyat alanını doldurun.",
        });
        continue;
      }

      const imageUrls = scraped.images?.length ? scraped.images : [];

      const existingLead = await prisma.fsboLead.findUnique({
        where: { url },
        select: { id: true, agentId: true },
      });

      if (existingLead) {
        if (existingLead.agentId !== agentId) {
          results.push({
            url,
            success: false,
            error:
              existingLead.agentId === null
                ? "Bu ilan sahipsiz kayıt; otomatik sahiplenme devre dışı."
                : "Bu ilan başka bir hesap tarafından içe aktarılmış.",
          });
          continue;
        }

        const lead = await prisma.fsboLead.update({
          where: { url },
          data: {
            title: scraped.title,
            price,
            location: scraped.location,
            il: loc.il,
            ilce: loc.ilce,
            region: loc.region,
            ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
          },
        });

        let portfolioId: string | undefined;

        if (options?.addToPortfolio) {
          portfolioId = await createPortfolioFromScraped(
            agentId,
            {
              title: scraped.title,
              price,
              location: scraped.location,
              m2: scraped.m2,
              url,
              images: scraped.images,
            },
            planType,
          );
        }

        imported += 1;
        results.push({
          url,
          success: true,
          mocked: scraped.mocked,
          leadId: lead.id,
          portfolioId,
        });
        continue;
      }

      const lead = await prisma.fsboLead.create({
        data: {
          title: scraped.title,
          price,
          url,
          source: scraped.source.toLowerCase(),
          images: imageUrls,
          region: loc.region,
          il: loc.il,
          ilce: loc.ilce,
          location: scraped.location,
          metrekare:
            scraped.m2 !== "—"
              ? parseInt(scraped.m2.replace(/\D/g, ""), 10) || null
              : null,
          agentId,
          isRead: false,
        },
      });

      let portfolioId: string | undefined;

      if (options?.addToPortfolio) {
        portfolioId = await createPortfolioFromScraped(
          agentId,
          {
            title: scraped.title,
            price,
            location: scraped.location,
            m2: scraped.m2,
            url,
            images: scraped.images,
          },
          planType,
        );
      }

      imported += 1;
      results.push({
        url,
        success: true,
        mocked: scraped.mocked,
        leadId: lead.id,
        portfolioId,
      });
    } catch (error) {
      results.push({
        url,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "İlan içe aktarılamadı.",
      });
    }
  }

  return { results, imported };
}

export async function listImportedLeadsForAgent(agentId: string, limit = 100) {
  const leads = await prisma.fsboLead.findMany({
    where: {
      isDiscarded: false,
      promotedDealId: null,
      ...agentOwnershipFilter(agentId),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return leads.map(serializeFsboLead);
}
