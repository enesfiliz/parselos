import { prisma } from "@/lib/prisma";

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

export type DashboardData = {
  metrics: {
    toplamMusteri: { value: number; current: number; previous: number };
    aktifEkspertiz: { value: number; current: number; previous: number };
    bekleyenRaporlar: { value: number; current: number; previous: number };
    aylikGoruntulenme: { value: number; current: number; previous: number };
  };
  sonAktiviteler: Array<{
    id: string;
    type: "musteri" | "ekspertiz" | "ilan";
    title: string;
    detail: string;
    href: string;
    olusturulmaTarihi: string;
  }>;
};

export async function getDashboardData(): Promise<DashboardData> {
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(-1);

  const [
    toplamMusteri,
    musteriBuAy,
    musteriGecenAy,
    toplamEkspertiz,
    ekspertizBuAy,
    ekspertizGecenAy,
    bekleyenRaporlar,
    bekleyenBuAy,
    bekleyenGecenAy,
    ilanBuAy,
    ilanGecenAy,
    sonMusteriler,
    sonRaporlar,
    sonIlanlar,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({
      where: {
        olusturulmaTarihi: { gte: thisMonth.start, lte: thisMonth.end },
      },
    }),
    prisma.client.count({
      where: {
        olusturulmaTarihi: { gte: lastMonth.start, lte: lastMonth.end },
      },
    }),
    prisma.appraisalReport.count(),
    prisma.appraisalReport.count({
      where: {
        olusturulmaTarihi: { gte: thisMonth.start, lte: thisMonth.end },
      },
    }),
    prisma.appraisalReport.count({
      where: {
        olusturulmaTarihi: { gte: lastMonth.start, lte: lastMonth.end },
      },
    }),
    prisma.appraisalReport.count({ where: { clientId: null } }),
    prisma.appraisalReport.count({
      where: {
        clientId: null,
        olusturulmaTarihi: { gte: thisMonth.start, lte: thisMonth.end },
      },
    }),
    prisma.appraisalReport.count({
      where: {
        clientId: null,
        olusturulmaTarihi: { gte: lastMonth.start, lte: lastMonth.end },
      },
    }),
    prisma.listingText.count({
      where: {
        olusturulmaTarihi: { gte: thisMonth.start, lte: thisMonth.end },
      },
    }),
    prisma.listingText.count({
      where: {
        olusturulmaTarihi: { gte: lastMonth.start, lte: lastMonth.end },
      },
    }),
    prisma.client.findMany({
      where: {
        NOT: {
          adSoyad: { startsWith: "FSBO —" },
        },
      },
      take: 5,
      orderBy: { olusturulmaTarihi: "desc" },
      select: {
        id: true,
        adSoyad: true,
        telefon: true,
        email: true,
        olusturulmaTarihi: true,
      },
    }),
    prisma.appraisalReport.findMany({
      take: 5,
      orderBy: { olusturulmaTarihi: "desc" },
      select: {
        id: true,
        baslik: true,
        ada: true,
        parsel: true,
        olusturulmaTarihi: true,
      },
    }),
    prisma.listingText.findMany({
      take: 5,
      orderBy: { olusturulmaTarihi: "desc" },
      select: {
        id: true,
        baslik: true,
        olusturulmaTarihi: true,
      },
    }),
  ]);

  const aylikGoruntulenme = ekspertizBuAy + ilanBuAy + musteriBuAy;
  const aylikGoruntulenmeGecenAy =
    ekspertizGecenAy + ilanGecenAy + musteriGecenAy;

  const sonAktiviteler = [
    ...sonMusteriler.map((client) => ({
      id: client.id,
      type: "musteri" as const,
      title: client.adSoyad,
      detail: client.telefon || client.email || "Yeni müşteri kaydı",
      href: "/musteriler",
      olusturulmaTarihi: client.olusturulmaTarihi.toISOString(),
    })),
    ...sonRaporlar.map((report) => ({
      id: report.id,
      type: "ekspertiz" as const,
      title: report.baslik,
      detail: `Ada ${report.ada} · Parsel ${report.parsel}`,
      href: "/arsiv",
      olusturulmaTarihi: report.olusturulmaTarihi.toISOString(),
    })),
    ...sonIlanlar.map((listing) => ({
      id: listing.id,
      type: "ilan" as const,
      title: listing.baslik,
      detail: "İlan metni oluşturuldu",
      href: "/ilan-asistani",
      olusturulmaTarihi: listing.olusturulmaTarihi.toISOString(),
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.olusturulmaTarihi).getTime() -
        new Date(a.olusturulmaTarihi).getTime(),
    )
    .slice(0, 8);

  return {
    metrics: {
      toplamMusteri: {
        value: toplamMusteri,
        current: musteriBuAy,
        previous: musteriGecenAy,
      },
      aktifEkspertiz: {
        value: toplamEkspertiz,
        current: ekspertizBuAy,
        previous: ekspertizGecenAy,
      },
      bekleyenRaporlar: {
        value: bekleyenRaporlar,
        current: bekleyenBuAy,
        previous: bekleyenGecenAy,
      },
      aylikGoruntulenme: {
        value: aylikGoruntulenme,
        current: aylikGoruntulenme,
        previous: aylikGoruntulenmeGecenAy,
      },
    },
    sonAktiviteler,
  };
}
