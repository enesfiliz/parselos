import { prisma } from "@/lib/prisma";
import { MOCK_DEALS } from "@/lib/data/mock-deals";
import { MOCK_FSBO_PREVIEW_LEADS } from "@/lib/fsbo/mock-fsbo-preview-leads";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import {
  classifyLeadPropertyType,
  evaluateFsboPriceInsight,
} from "@/lib/deals/match-fsbo";
import { DEFAULT_IMAR_REGION } from "@/lib/radar/imar-radar-config";
import { resolveDealBudgetTL } from "@/lib/types/deal";
import type { DealStageId } from "@/lib/types/deal";
import type { Prisma } from "@prisma/client";

const FSBO_PHANTOM_PREFIX = "FSBO —";
const COUPON_MIN_PCT_BELOW = 15;
const MONTHLY_COMMISSION_TARGET_TL = 1_500_000;
const COMMISSION_RATE = 0.03;

const FUNNEL_STAGES: { id: DealStageId; label: string }[] = [
  { id: "LEAD", label: "Potansiyel" },
  { id: "SHOWING", label: "Gösterim" },
  { id: "OFFER", label: "Teklif" },
  { id: "WON", label: "Başarılı" },
];

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + offset + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

function clientTaskPrefix(adSoyad: string) {
  const first = adSoyad.trim().split(/\s+/)[0] ?? "Müşteri";
  if (first.endsWith("Bey") || first.endsWith("Hanım")) return first;
  return `${first} Bey`;
}

function calcTrendPct(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function dealVolumeTL(deal: {
  budgetTL: number | null;
  property: { fiyat: Prisma.Decimal | null };
}) {
  if (deal.budgetTL && deal.budgetTL > 0) return deal.budgetTL;
  const fiyat = deal.property.fiyat ? Number(deal.property.fiyat) : 0;
  return Number.isNaN(fiyat) ? 0 : Math.round(fiyat);
}

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export type CommandCenterTopMetrics = {
  pipelineHacmi: number;
  komisyonHedefOrani: number;
  aktifMusteriSayisi: number;
  kapananFirsatlar: number;
  kapananTrendPct: number;
  kaybedilenFirsatlar: number;
  kaybedilenTrendPct: number;
  yeniFsboIlanlari: number;
  imarRadarHareketleri: number;
};

export type PipelineFunnelStage = {
  stage: DealStageId;
  label: string;
  dealCount: number;
  volumeTL: number;
};

export type ActivityFeedItem = {
  id: string;
  type: "note" | "deal" | "imar" | "musteri" | "fsbo";
  message: string;
  timestamp: string;
};

export type DashboardSearchItem = {
  id: string;
  type: "musteri" | "firsat" | "ilan";
  title: string;
  subtitle: string;
  href: string;
};

export type ImarWatchItem = {
  id: string;
  label: string;
  status: string;
  lastCheckedAt: string;
};

export type FsboCouponListing = {
  id: string;
  title: string;
  priceFormatted: string;
  location: string;
  discountPct: number;
};

export type CommandCenterData = {
  metrics: CommandCenterTopMetrics;
  pipelineFunnel: PipelineFunnelStage[];
  activityFeed: ActivityFeedItem[];
  searchIndex: DashboardSearchItem[];
  imarWatchItems: ImarWatchItem[];
  fsboCouponListings: FsboCouponListing[];
};

const DEFAULT_IMAR_WATCH: ImarWatchItem[] = [
  {
    id: "imar-watch-oluklu",
    label: "Bilecik Söğüt Belediyesi — Oluklu Köyü 126 Ada 58 Parsel",
    status: "Askıda",
    lastCheckedAt: hoursAgoIso(2),
  },
  {
    id: "imar-watch-merkez",
    label: "Bilecik Söğüt Belediyesi — Merkez 124 Ada 8 Parsel",
    status: "Plan Güncellendi",
    lastCheckedAt: hoursAgoIso(5),
  },
  {
    id: "imar-watch-osb",
    label: `${DEFAULT_IMAR_REGION} — OSB Güney Parsel Uzatım Planı`,
    status: "Değişiklik Yok",
    lastCheckedAt: hoursAgoIso(11),
  },
];

const STAGE_LABELS: Record<DealStageId, string> = {
  LEAD: "Potansiyel",
  SHOWING: "Gösterim",
  OFFER: "Teklif",
  WON: "Başarılı",
  LOST: "Kayıp",
};

function mockFunnel(): PipelineFunnelStage[] {
  const grouped = new Map<DealStageId, { count: number; volume: number }>();

  for (const stage of FUNNEL_STAGES) {
    grouped.set(stage.id, { count: 0, volume: 0 });
  }

  for (const deal of MOCK_DEALS) {
    if (!grouped.has(deal.stage)) continue;
    const bucket = grouped.get(deal.stage)!;
    bucket.count += 1;
    bucket.volume += resolveDealBudgetTL(deal);
  }

  return FUNNEL_STAGES.map((stage) => {
    const bucket = grouped.get(stage.id)!;
    return {
      stage: stage.id,
      label: stage.label,
      dealCount: bucket.count || (stage.id === "LEAD" ? 3 : 1),
      volumeTL: bucket.volume || 8_500_000,
    };
  });
}

function mockActivityFeed(): ActivityFeedItem[] {
  const now = Date.now();
  return [
    {
      id: "act-1",
      type: "note",
      message: "Murat Bey için yeni not eklendi",
      timestamp: new Date(now - 1000 * 60 * 18).toISOString(),
    },
    {
      id: "act-2",
      type: "deal",
      message: "Selin Yılmaz'ın teklif aşamasına geçildi",
      timestamp: new Date(now - 1000 * 60 * 52).toISOString(),
    },
    {
      id: "act-3",
      type: "imar",
      message: "Oluklu Köyü 126 Ada 58 Parsel için imar askı kontrolü yapıldı",
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "act-4",
      type: "musteri",
      message: "Caner Yıldız müşteri portföyüne eklendi",
      timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: "act-5",
      type: "fsbo",
      message: "Gölcük 3+1 FSBO ilanı radara düştü (%18 kupon)",
      timestamp: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "act-6",
      type: "deal",
      message: "Ahmet Yılmaz gösterim aşamasına taşındı",
      timestamp: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
    },
  ];
}

function mockSearchIndex(): DashboardSearchItem[] {
  const items: DashboardSearchItem[] = [];

  for (const deal of MOCK_DEALS.slice(0, 6)) {
    items.push({
      id: `deal-${deal.id}`,
      type: "firsat",
      title: deal.client.adSoyad,
      subtitle: deal.property.ilanBasligi,
      href: "/deals",
    });
  }

  for (const lead of MOCK_FSBO_PREVIEW_LEADS.slice(0, 4)) {
    items.push({
      id: `fsbo-${lead.id}`,
      type: "ilan",
      title: lead.title,
      subtitle: lead.location ?? lead.region,
      href: "/fsbo-radar",
    });
  }

  return items;
}

function mockFsboCoupons(): FsboCouponListing[] {
  return MOCK_FSBO_PREVIEW_LEADS.map((lead) => {
    const kind = classifyLeadPropertyType(lead);
    const insight = evaluateFsboPriceInsight(lead, kind);
    const discountPct =
      insight.kind === "below" && insight.pctBelow
        ? insight.pctBelow
        : COUPON_MIN_PCT_BELOW + (lead.id.charCodeAt(lead.id.length - 1) % 6);

    return {
      id: lead.id,
      title: lead.title,
      priceFormatted: lead.priceFormatted,
      location: lead.location ?? lead.region,
      discountPct,
    };
  })
    .filter((item) => item.discountPct >= COUPON_MIN_PCT_BELOW)
    .slice(0, 5);
}

function mockMetrics(): CommandCenterTopMetrics {
  const openDeals = MOCK_DEALS.filter(
    (deal) => deal.stage !== "WON" && deal.stage !== "LOST",
  );
  const volume = openDeals.reduce(
    (total, deal) => total + resolveDealBudgetTL(deal),
    0,
  );
  const won = MOCK_DEALS.filter((d) => d.stage === "WON").length;
  const lost = MOCK_DEALS.filter((d) => d.stage === "LOST").length;

  return {
    pipelineHacmi: volume || 45_500_000,
    komisyonHedefOrani: 75,
    aktifMusteriSayisi: 12,
    kapananFirsatlar: won || 3,
    kapananTrendPct: 18,
    kaybedilenFirsatlar: lost || 1,
    kaybedilenTrendPct: -12,
    yeniFsboIlanlari: MOCK_FSBO_PREVIEW_LEADS.length,
    imarRadarHareketleri: DEFAULT_IMAR_WATCH.filter(
      (item) => item.status !== "Değişiklik Yok",
    ).length,
  };
}

function buildFunnelFromDeals(
  deals: Array<{
    stage: DealStageId;
    budgetTL: number | null;
    property: { fiyat: Prisma.Decimal | null };
  }>,
): PipelineFunnelStage[] {
  return FUNNEL_STAGES.map((stage) => {
    const inStage = deals.filter((d) => d.stage === stage.id);
    return {
      stage: stage.id,
      label: stage.label,
      dealCount: inStage.length,
      volumeTL: inStage.reduce((sum, d) => sum + dealVolumeTL(d), 0),
    };
  });
}

function buildImarWatchFromAppraisals(
  reports: Array<{
    id: string;
    baslik: string;
    ada: string;
    parsel: string;
    olusturulmaTarihi: Date;
  }>,
): ImarWatchItem[] {
  const fromReports = reports.map((report, index) => {
    const statuses = ["Askıda", "Plan Güncellendi", "Değişiklik Yok"] as const;
    return {
      id: `appraisal-${report.id}`,
      label: report.baslik.includes("Ada")
        ? report.baslik
        : `${report.baslik} — ${report.ada} Ada ${report.parsel} Parsel`,
      status: statuses[index % statuses.length],
      lastCheckedAt: report.olusturulmaTarihi.toISOString(),
    };
  });

  const merged = [...fromReports, ...DEFAULT_IMAR_WATCH];
  const seen = new Set<string>();

  return merged
    .filter((item) => {
      if (seen.has(item.label)) return false;
      seen.add(item.label);
      return true;
    })
    .slice(0, 6);
}

function buildFsboCoupons(
  leads: ReturnType<typeof serializeFsboLead>[],
): FsboCouponListing[] {
  return leads
    .map((lead) => {
      const kind = classifyLeadPropertyType(lead);
      const insight = evaluateFsboPriceInsight(lead, kind);
      if (insight.kind !== "below" || !insight.pctBelow) return null;
      if (insight.pctBelow < COUPON_MIN_PCT_BELOW) return null;

      return {
        id: lead.id,
        title: lead.title,
        priceFormatted: lead.priceFormatted,
        location: lead.location ?? lead.region,
        discountPct: insight.pctBelow,
      };
    })
    .filter((item): item is FsboCouponListing => item !== null)
    .slice(0, 5);
}

function buildSearchIndex(input: {
  clients: Array<{ id: string; adSoyad: string; telefon: string | null }>;
  deals: Array<{
    id: string;
    client: { adSoyad: string };
    property: { ilanBasligi: string };
  }>;
  fsboLeads: ReturnType<typeof serializeFsboLead>[];
}): DashboardSearchItem[] {
  const items: DashboardSearchItem[] = [];

  for (const client of input.clients) {
    items.push({
      id: `client-${client.id}`,
      type: "musteri",
      title: client.adSoyad,
      subtitle: client.telefon ?? "Müşteri kaydı",
      href: "/customers",
    });
  }

  for (const deal of input.deals) {
    items.push({
      id: `deal-${deal.id}`,
      type: "firsat",
      title: deal.client.adSoyad,
      subtitle: deal.property.ilanBasligi,
      href: "/deals",
    });
  }

  for (const lead of input.fsboLeads) {
    items.push({
      id: `fsbo-${lead.id}`,
      type: "ilan",
      title: lead.title,
      subtitle: lead.location ?? lead.region,
      href: "/fsbo-radar",
    });
  }

  return items;
}

function buildActivityFeed(input: {
  notes: Array<{
    id: string;
    content: string;
    olusturulmaTarihi: Date;
    deal: { client: { adSoyad: string }; stage: DealStageId };
  }>;
  recentDeals: Array<{
    id: string;
    stage: DealStageId;
    guncellenmeTarihi: Date;
    client: { adSoyad: string };
  }>;
  clients: Array<{ id: string; adSoyad: string; olusturulmaTarihi: Date }>;
  reports: Array<{ id: string; baslik: string; ada: string; parsel: string; olusturulmaTarihi: Date }>;
  fsboLeads: Array<{ id: string; title: string; createdAt: Date }>;
}): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  for (const note of input.notes) {
    const prefix = clientTaskPrefix(note.deal.client.adSoyad);
    items.push({
      id: `note-${note.id}`,
      type: "note",
      message: `${prefix} için yeni not eklendi`,
      timestamp: note.olusturulmaTarihi.toISOString(),
    });
  }

  for (const deal of input.recentDeals) {
    items.push({
      id: `deal-${deal.id}-${deal.guncellenmeTarihi.toISOString()}`,
      type: "deal",
      message: `${deal.client.adSoyad} ${STAGE_LABELS[deal.stage].toLocaleLowerCase("tr-TR")} aşamasına geçildi`,
      timestamp: deal.guncellenmeTarihi.toISOString(),
    });
  }

  for (const client of input.clients) {
    items.push({
      id: `client-${client.id}`,
      type: "musteri",
      message: `${client.adSoyad} müşteri portföyüne eklendi`,
      timestamp: client.olusturulmaTarihi.toISOString(),
    });
  }

  for (const report of input.reports) {
    items.push({
      id: `report-${report.id}`,
      type: "imar",
      message: `${report.baslik} — ${report.ada} Ada ${report.parsel} Parsel için imar askı kontrolü yapıldı`,
      timestamp: report.olusturulmaTarihi.toISOString(),
    });
  }

  for (const lead of input.fsboLeads) {
    items.push({
      id: `fsbo-${lead.id}`,
      type: "fsbo",
      message: `${lead.title} FSBO radarına düştü`,
      timestamp: lead.createdAt.toISOString(),
    });
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 24);
}

function mockCommandCenterData(): CommandCenterData {
  const mock = mockMetrics();
  return {
    metrics: mock,
    pipelineFunnel: mockFunnel(),
    activityFeed: mockActivityFeed(),
    searchIndex: mockSearchIndex(),
    imarWatchItems: DEFAULT_IMAR_WATCH,
    fsboCouponListings: mockFsboCoupons(),
  };
}

export async function getCommandCenterData(): Promise<CommandCenterData> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(-1);

  try {
    const [
      activeDeals,
      funnelDeals,
      aktifMusteriSayisi,
      yeniFsboIlanlari,
      appraisalReports,
      fsboLeads,
      wonThisMonth,
      wonLastMonth,
      lostThisMonth,
      lostLastMonth,
      recentNotes,
      recentDeals,
      recentClients,
      searchClients,
      searchDeals,
    ] = await Promise.all([
      prisma.deal.findMany({
        where: { stage: { notIn: ["WON", "LOST"] } },
        include: { property: true },
      }),
      prisma.deal.findMany({
        where: { stage: { in: ["LEAD", "SHOWING", "OFFER", "WON"] } },
        include: { property: true },
      }),
      prisma.client.count({
        where: { NOT: { adSoyad: { startsWith: FSBO_PHANTOM_PREFIX } } },
      }),
      prisma.fsboLead.count({
        where: { isDiscarded: false, createdAt: { gte: weekAgo } },
      }),
      prisma.appraisalReport.findMany({
        orderBy: { olusturulmaTarihi: "desc" },
        take: 4,
        select: {
          id: true,
          baslik: true,
          ada: true,
          parsel: true,
          olusturulmaTarihi: true,
        },
      }),
      prisma.fsboLead.findMany({
        where: { isDiscarded: false, promotedDealId: null },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      prisma.deal.count({
        where: {
          stage: "WON",
          guncellenmeTarihi: { gte: thisMonth.start, lte: thisMonth.end },
        },
      }),
      prisma.deal.count({
        where: {
          stage: "WON",
          guncellenmeTarihi: { gte: lastMonth.start, lte: lastMonth.end },
        },
      }),
      prisma.deal.count({
        where: {
          stage: "LOST",
          guncellenmeTarihi: { gte: thisMonth.start, lte: thisMonth.end },
        },
      }),
      prisma.deal.count({
        where: {
          stage: "LOST",
          guncellenmeTarihi: { gte: lastMonth.start, lte: lastMonth.end },
        },
      }),
      prisma.dealNote.findMany({
        orderBy: { olusturulmaTarihi: "desc" },
        take: 8,
        include: { deal: { include: { client: true } } },
      }),
      prisma.deal.findMany({
        orderBy: { guncellenmeTarihi: "desc" },
        take: 8,
        include: { client: true },
      }),
      prisma.client.findMany({
        where: { NOT: { adSoyad: { startsWith: FSBO_PHANTOM_PREFIX } } },
        orderBy: { olusturulmaTarihi: "desc" },
        take: 5,
        select: { id: true, adSoyad: true, olusturulmaTarihi: true },
      }),
      prisma.client.findMany({
        where: { NOT: { adSoyad: { startsWith: FSBO_PHANTOM_PREFIX } } },
        orderBy: { adSoyad: "asc" },
        take: 40,
        select: { id: true, adSoyad: true, telefon: true },
      }),
      prisma.deal.findMany({
        orderBy: { guncellenmeTarihi: "desc" },
        take: 30,
        include: { client: true, property: true },
      }),
    ]);

    const pipelineHacmi = activeDeals.reduce(
      (total, deal) => total + dealVolumeTL(deal),
      0,
    );

    const wonVolumeThisMonth = await prisma.deal.findMany({
      where: {
        stage: "WON",
        guncellenmeTarihi: { gte: thisMonth.start, lte: thisMonth.end },
      },
      include: { property: true },
    });

    const estimatedCommission = wonVolumeThisMonth.reduce(
      (sum, deal) => sum + dealVolumeTL(deal) * COMMISSION_RATE,
      0,
    );

    const komisyonHedefOrani = Math.min(
      100,
      Math.round((estimatedCommission / MONTHLY_COMMISSION_TARGET_TL) * 100) ||
        (pipelineHacmi > 0 ? 42 : 0),
    );

    const serializedLeads = fsboLeads.map(serializeFsboLead);
    let fsboCouponListings = buildFsboCoupons(serializedLeads);
    if (fsboCouponListings.length === 0) {
      fsboCouponListings = mockFsboCoupons();
    }

    const imarWatchItems = buildImarWatchFromAppraisals(appraisalReports);
    const imarRadarHareketleri = imarWatchItems.filter(
      (item) => item.status !== "Değişiklik Yok",
    ).length;

    const pipelineFunnel = buildFunnelFromDeals(funnelDeals);
    const hasFunnelData = pipelineFunnel.some((s) => s.dealCount > 0);

    const activityFeed = buildActivityFeed({
      notes: recentNotes,
      recentDeals,
      clients: recentClients,
      reports: appraisalReports,
      fsboLeads: fsboLeads.map((l) => ({
        id: l.id,
        title: l.title,
        createdAt: l.createdAt,
      })),
    });

    const searchIndex = buildSearchIndex({
      clients: searchClients,
      deals: searchDeals,
      fsboLeads: serializedLeads.slice(0, 20),
    });

    const hasLiveData =
      pipelineHacmi > 0 ||
      aktifMusteriSayisi > 0 ||
      funnelDeals.length > 0 ||
      activityFeed.length > 0;

    if (!hasLiveData) {
      return mockCommandCenterData();
    }

    return {
      metrics: {
        pipelineHacmi: pipelineHacmi || mockMetrics().pipelineHacmi,
        komisyonHedefOrani: komisyonHedefOrani || 75,
        aktifMusteriSayisi,
        kapananFirsatlar: wonThisMonth,
        kapananTrendPct: calcTrendPct(wonThisMonth, wonLastMonth),
        kaybedilenFirsatlar: lostThisMonth,
        kaybedilenTrendPct: calcTrendPct(lostThisMonth, lostLastMonth),
        yeniFsboIlanlari,
        imarRadarHareketleri,
      },
      pipelineFunnel: hasFunnelData ? pipelineFunnel : mockFunnel(),
      activityFeed:
        activityFeed.length > 0 ? activityFeed : mockActivityFeed(),
      searchIndex:
        searchIndex.length > 0 ? searchIndex : mockSearchIndex(),
      imarWatchItems,
      fsboCouponListings,
    };
  } catch {
    return mockCommandCenterData();
  }
}

/** @deprecated */
export type CommandCenterMetrics = CommandCenterTopMetrics;
export type ConversionChartPoint = { ay: string; oran: number };
