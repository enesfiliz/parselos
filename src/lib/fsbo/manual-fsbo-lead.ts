import "server-only";

import { assertCanImportListing } from "@/lib/billing/enforce-limits";
import { agentOwnershipFilter } from "@/lib/auth/agent";
import {
  buildManualLeadUrl,
  buildTrackingSpecs,
  isPublicSourceUrl,
  type FsboPriority,
  type FsboTrackingStatus,
} from "@/lib/fsbo/fsbo-tracking";
import { parsePriceToInteger } from "@/lib/fsbo/price-parser";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { detectListingSource } from "@/lib/scrape/listing-scraper";
import { prisma } from "@/lib/prisma";
import type { TenantPlanType } from "@/lib/account/types";

export type ManualFsboLeadInput = {
  title: string;
  location: string;
  price: string | number;
  notes?: string;
  sourceUrl?: string;
  priority: FsboPriority;
  trackingStatus: FsboTrackingStatus;
  nextFollowUpAt?: string;
  metrekare?: string | number;
};

function parseLocationParts(location: string) {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      il: parts[parts.length - 1]!,
      ilce: parts[0]!,
      region: location,
    };
  }

  return {
    il: null,
    ilce: parts[0] ?? null,
    region: location || "Türkiye",
  };
}

export async function createManualFsboLeadForAgent(
  agentId: string,
  planType: TenantPlanType,
  input: ManualFsboLeadInput,
) {
  await assertCanImportListing(planType, agentId, 1);

  const title = input.title.trim();
  if (title.length < 4) {
    throw new Error("Başlık en az 4 karakter olmalıdır.");
  }

  const location = input.location.trim();
  if (!location) {
    throw new Error("Konum zorunludur.");
  }

  const price = parsePriceToInteger(String(input.price)) ?? 0;
  if (price <= 0) {
    throw new Error("Geçerli bir fiyat girin.");
  }

  const sourceUrl = input.sourceUrl?.trim();
  if (sourceUrl && !isPublicSourceUrl(sourceUrl)) {
    throw new Error("Kaynak linki geçerli bir http/https URL olmalıdır.");
  }

  const url = sourceUrl && isPublicSourceUrl(sourceUrl)
    ? sourceUrl
    : buildManualLeadUrl(agentId);

  const existing = await prisma.fsboLead.findUnique({
    where: { url },
    select: { id: true, agentId: true },
  });

  if (existing && existing.agentId !== agentId) {
    throw new Error("Bu kaynak linki başka bir hesapta kayıtlı.");
  }

  const loc = parseLocationParts(location);
  const sqmRaw = input.metrekare
    ? parseInt(String(input.metrekare).replace(/\D/g, ""), 10)
    : null;
  const metrekare = sqmRaw && !Number.isNaN(sqmRaw) ? sqmRaw : null;
  const listedAt = input.nextFollowUpAt
    ? new Date(input.nextFollowUpAt)
    : null;

  if (listedAt && Number.isNaN(listedAt.getTime())) {
    throw new Error("Sonraki takip tarihi geçersiz.");
  }

  const data = {
    title,
    price,
    url,
    source: sourceUrl ? detectListingSource(sourceUrl).toLowerCase() : "manual",
    region: loc.region,
    il: loc.il,
    ilce: loc.ilce,
    location,
    metrekare,
    description: input.notes?.trim() || null,
    listedAt,
    agentId,
    isRead: false,
    isDiscarded: false,
    specs: buildTrackingSpecs({
      priority: input.priority,
      trackingStatus: input.trackingStatus,
      manualEntry: true,
      brutM2: metrekare,
    }),
  };

  const lead = existing
    ? await prisma.fsboLead.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.fsboLead.create({ data });

  return serializeFsboLead(lead);
}

export async function listActiveFsboLeadsForAgent(agentId: string, limit = 100) {
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
