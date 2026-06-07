import "server-only";

import type { Prisma } from "@prisma/client";

import { buildDefaultSpecs, pickImagesForLead } from "@/lib/fsbo/fsbo-media";
import {
  getFsboSyncTargets,
  type FsboSyncTarget,
} from "@/lib/fsbo/fsbo-sync-targets";
import { parseSahibindenDetailPage } from "@/lib/fsbo/parse-sahibinden-detail";
import {
  extractListingLinksFromSearch,
  isCompleteParsedListing,
  parseSahibindenSearchResults,
  type ParsedFsboListing,
} from "@/lib/fsbo/parse-sahibinden-list";
import { fetchHtmlViaScraperApi, hasScraperApiKey } from "@/lib/fsbo/scraper-api";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { prisma } from "@/lib/prisma";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SyncStats = {
  fetched: number;
  parsed: number;
  inserted: number;
  skipped: number;
  errors: string[];
};

function splitLocation(
  location: string | null,
  target: FsboSyncTarget,
): { location: string; mahalle: string | null } {
  if (!location?.trim()) {
    return {
      location: `${target.ilce}, ${target.il}`,
      mahalle: null,
    };
  }

  const parts = location
    .split(/[,\/]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    location: parts.join(", "),
    mahalle: parts[0] ?? null,
  };
}

function buildLeadPayload(
  listing: ParsedFsboListing & {
    title: string;
    url: string;
    price: number;
  },
  target: FsboSyncTarget,
) {
  const { location, mahalle } = splitLocation(listing.location, target);
  const images = listing.coverImage?.trim()
    ? [listing.coverImage]
    : pickImagesForLead(listing.url, 1);

  return {
    title: listing.title,
    url: listing.url,
    price: listing.price,
    location,
    region: target.region,
    il: target.il,
    ilce: target.ilce,
    mahalle,
    metrekare: listing.metrekare,
    odaSayisi: listing.odaSayisi,
    source: target.source,
    islemTipi: target.islemTipi,
    kategori: target.kategori,
    listingNo: listing.listingNo,
    description: `${listing.title}. ${location} bölgesinde Sahibinden üzerinden çekilen canlı FSBO kaydı.`,
    images,
    specs: buildDefaultSpecs({
      ilanNo: listing.listingNo ?? undefined,
      brutM2: listing.metrekare,
      netM2: listing.metrekare ? Math.round(listing.metrekare * 0.88) : null,
      odaSayisi: listing.odaSayisi,
    }) as Prisma.InputJsonValue,
    isRead: false,
    isDiscarded: false,
    listedAt: listing.listedAt ?? new Date(),
  };
}

async function fetchDetailListings(
  searchHtml: string,
  searchUrl: string,
  target: FsboSyncTarget,
  stats: SyncStats,
): Promise<ParsedFsboListing[]> {
  const links = extractListingLinksFromSearch(searchHtml);
  if (links.length === 0) {
    stats.errors.push(`Detay linki bulunamadı: ${target.region}`);
    return [];
  }

  const listings: ParsedFsboListing[] = [];

  for (const link of links) {
    const detailHtml = await fetchHtmlViaScraperApi(link);
    if (!detailHtml) continue;

    stats.fetched += 1;

    try {
      const parsed = parseSahibindenDetailPage(link, detailHtml);
      if (parsed) listings.push(parsed);
    } catch (error) {
      console.error(`[fsbo-sync] Detay parse hatası (${link}):`, error);
    }

    const minDelay = Number(process.env.FSBO_MIN_DELAY_MS ?? 2000);
    if (minDelay > 0) {
      await delay(minDelay);
    }
  }

  return listings;
}

async function syncTarget(
  target: FsboSyncTarget,
  stats: SyncStats,
): Promise<FsboLeadData[]> {
  const html = await fetchHtmlViaScraperApi(target.searchUrl);
  if (!html) {
    stats.errors.push(`HTML alınamadı: ${target.searchUrl}`);
    return [];
  }

  stats.fetched += 1;

  let parsedListings = parseSahibindenSearchResults(html);
  stats.parsed += parsedListings.length;

  if (parsedListings.length === 0) {
    console.error(
      `[fsbo-sync] Liste parse boş (${target.region}), detay sayfası fallback deneniyor.`,
    );
    parsedListings = await fetchDetailListings(html, target.searchUrl, target, stats);
    stats.parsed += parsedListings.length;
  }

  if (parsedListings.length === 0) {
    stats.errors.push(`Parse sonucu boş: ${target.region}`);
    return [];
  }

  const saved: FsboLeadData[] = [];

  for (const listing of parsedListings) {
    if (!isCompleteParsedListing(listing)) {
      stats.skipped += 1;
      console.error(
        `[fsbo-sync] Eksik ilan atlandı (${target.region}):`,
        listing.url ?? listing.title ?? "bilinmiyor",
      );
      continue;
    }

    try {
      const payload = buildLeadPayload(listing, target);
      const lead = await prisma.fsboLead.upsert({
        where: { url: payload.url },
        update: {
          title: payload.title,
          price: payload.price,
          location: payload.location,
          region: payload.region,
          il: payload.il,
          ilce: payload.ilce,
          mahalle: payload.mahalle,
          metrekare: payload.metrekare,
          odaSayisi: payload.odaSayisi,
          source: payload.source,
          islemTipi: payload.islemTipi,
          kategori: payload.kategori,
          listingNo: payload.listingNo,
          description: payload.description,
          images: payload.images,
          specs: payload.specs,
          listedAt: payload.listedAt,
        },
        create: payload,
      });

      stats.inserted += 1;
      saved.push(serializeFsboLead(lead));
    } catch (error) {
      stats.skipped += 1;
      console.error(
        `[fsbo-sync] Prisma kaydı başarısız (${listing.url}):`,
        error,
      );
    }
  }

  return saved;
}

export async function runFsboScraperSync(): Promise<{
  leads: FsboLeadData[];
  stats: SyncStats;
  message: string | null;
}> {
  if (!hasScraperApiKey()) {
    return {
      leads: [],
      stats: {
        fetched: 0,
        parsed: 0,
        inserted: 0,
        skipped: 0,
        errors: ["SCRAPER_API_KEY tanımlı değil."],
      },
      message:
        "SCRAPER_API_KEY eksik. .env.local dosyasına ScraperAPI anahtarınızı ekleyin ve dev sunucusunu yeniden başlatın.",
    };
  }

  const targets = getFsboSyncTargets();
  const stats: SyncStats = {
    fetched: 0,
    parsed: 0,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  const allLeads: FsboLeadData[] = [];

  const minDelay = Number(process.env.FSBO_MIN_DELAY_MS ?? 4500);

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];

    if (index > 0 && minDelay > 0) {
      await delay(minDelay);
    }

    try {
      const leads = await syncTarget(target, stats);
      allLeads.push(...leads);
    } catch (error) {
      console.error(`[fsbo-sync] Hedef senkronizasyonu başarısız (${target.region}):`, error);
      stats.errors.push(`${target.region}: senkronizasyon hatası`);
    }
  }

  const message =
    allLeads.length === 0
      ? stats.errors[0] ??
        "Canlı ilan bulunamadı. ScraperAPI kotanızı veya Sahibinden URL'lerini kontrol edin."
      : null;

  return { leads: allLeads, stats, message };
}
