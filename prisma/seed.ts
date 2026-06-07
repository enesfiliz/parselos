/**
 * Demo pipeline — 3 gerçekçi müşteri, fırsat, görev, not ve FSBO eşleşmeleri.
 * Çalıştırma: npm run db:seed
 */
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import {
  DealStage,
  PrismaClient,
  PropertyListingStatus,
  PropertyOwnershipType,
} from "@prisma/client";

import { createPgPool } from "../src/lib/pg-pool";

function createSeedPrisma() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL tanımlı değil (.env.local kontrol edin).");
  }

  const pool = createPgPool(databaseUrl);

  return {
    prisma: new PrismaClient({ adapter: new PrismaPg(pool) }),
    pool,
  };
}

const { prisma, pool } = createSeedPrisma();

const IDS = {
  clients: {
    murat: "seed-client-murat-korkmaz",
    selin: "seed-client-selin-yilmaz",
    caner: "seed-client-caner-yildiz",
  },
  properties: {
    murat: "seed-property-murat-arsa",
    selin: "seed-property-selin-daire",
    caner: "seed-property-caner-ticari",
  },
  deals: {
    murat: "seed-deal-murat-korkmaz",
    selin: "seed-deal-selin-yilmaz",
    caner: "seed-deal-caner-yildiz",
  },
} as const;

const FSBO_URLS = [
  "https://www.sahibinden.com/ilan/seed-demo-golcuk-arsa-001",
  "https://www.sahibinden.com/ilan/seed-demo-golcuk-tarla-002",
  "https://www.emlakjet.com/ilan/seed-demo-golcuk-arsa-003",
  "https://www.emlakjet.com/ilan/seed-demo-basiskele-3plus1-004",
  "https://www.sahibinden.com/ilan/seed-demo-basiskele-daire-005",
  "https://www.sahibinden.com/ilan/seed-demo-kocaeli-ticari-006",
  "https://www.emlakjet.com/ilan/seed-demo-gebze-kat-karsiligi-007",
] as const;

const noteAt = (iso: string) => new Date(iso);

async function clearPreviousSeed() {
  const clientIds = Object.values(IDS.clients);
  const dealIds = Object.values(IDS.deals);
  const propertyIds = Object.values(IDS.properties);

  await prisma.dealNote.deleteMany({ where: { dealId: { in: dealIds } } });
  await prisma.deal.deleteMany({ where: { id: { in: dealIds } } });
  await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
  await prisma.property.deleteMany({ where: { id: { in: propertyIds } } });
  await prisma.fsboLead.deleteMany({ where: { url: { in: [...FSBO_URLS] } } });
}

async function seedFsboLeads() {
  const image =
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop";

  const leads = [
    {
      id: "seed-fsbo-murat-001",
      title: "Gölcük Oluklu Acil Satılık İmarlı Arsa",
      price: 8_200_000,
      url: FSBO_URLS[0],
      source: "sahibinden",
      region: "Kocaeli/Gölcük",
      il: "Kocaeli",
      ilce: "Gölcük",
      mahalle: "Oluklu",
      location: "Oluklu Köyü, Gölcük, Kocaeli",
      metrekare: 1_250,
      kategori: "ARSA",
      islemTipi: "SATILIK",
      description:
        "Acil satılık imarlı arsa. Yatırımcıya uygun, tapu temiz, hissesiz.",
      listedAt: noteAt("2026-05-28T10:00:00.000Z"),
    },
    {
      id: "seed-fsbo-murat-002",
      title: "Gölcük Değirmendere Yatırımlık Tarla / Arsa",
      price: 7_900_000,
      url: FSBO_URLS[1],
      source: "sahibinden",
      region: "Kocaeli/Gölcük",
      il: "Kocaeli",
      ilce: "Gölcük",
      mahalle: "Değirmendere",
      location: "Değirmendere, Gölcük, Kocaeli",
      metrekare: 2_100,
      kategori: "ARSA",
      islemTipi: "SATILIK",
      description: "FSBO Radarı — acil satılık tarla/arsa, imar planı sorgulanabilir.",
      listedAt: noteAt("2026-05-30T08:30:00.000Z"),
    },
    {
      id: "seed-fsbo-murat-003",
      title: "Gölcük'te Yatırımlık İmarlı Parsel",
      price: 8_750_000,
      url: FSBO_URLS[2],
      source: "emlakjet",
      region: "Kocaeli/Gölcük",
      il: "Kocaeli",
      ilce: "Gölcük",
      mahalle: "Uğurtepe",
      location: "Uğurtepe, Gölcük, Kocaeli",
      metrekare: 980,
      kategori: "ARSA",
      islemTipi: "SATILIK",
      description: "Emlakjet üzerinden doğrudan mal sahibi ilanı.",
      listedAt: noteAt("2026-05-31T14:00:00.000Z"),
    },
    {
      id: "seed-fsbo-selin-001",
      title: "Başiskele Sahil 3+1 Sıfır Daire — Geniş Balkon",
      price: 5_950_000,
      url: FSBO_URLS[3],
      source: "emlakjet",
      region: "Kocaeli/Başiskele",
      il: "Kocaeli",
      ilce: "Başiskele",
      mahalle: "Kirazpınar",
      location: "Kirazpınar Sahil, Başiskele, Kocaeli",
      metrekare: 142,
      odaSayisi: "3+1",
      kategori: "KONUT",
      islemTipi: "SATILIK",
      description: "Deniz manzaralı, geniş balkonlu sıfır daire.",
      listedAt: noteAt("2026-06-03T09:00:00.000Z"),
    },
    {
      id: "seed-fsbo-selin-002",
      title: "Başiskele Merkez 3+1 Lüks Daire",
      price: 6_400_000,
      url: FSBO_URLS[4],
      source: "sahibinden",
      region: "Kocaeli/Başiskele",
      il: "Kocaeli",
      ilce: "Başiskele",
      mahalle: "Yeniköy",
      location: "Yeniköy Merkez, Başiskele, Kocaeli",
      metrekare: 155,
      odaSayisi: "3+1",
      kategori: "KONUT",
      islemTipi: "SATILIK",
      description: "Merkezi konumda geniş balkonlu 3+1.",
      listedAt: noteAt("2026-06-04T11:00:00.000Z"),
    },
    {
      id: "seed-fsbo-caner-001",
      title: "İzmit Ticari İmarlı Kupon Yer",
      price: 14_500_000,
      url: FSBO_URLS[5],
      source: "sahibinden",
      region: "Kocaeli/İzmit",
      il: "Kocaeli",
      ilce: "İzmit",
      location: "Sanayi Caddesi, İzmit, Kocaeli",
      metrekare: 620,
      kategori: "TICARI",
      islemTipi: "SATILIK",
      description: "Ticari imarlı kupon, kat karşılığı değerlendirmeye uygun.",
      listedAt: noteAt("2026-05-25T10:00:00.000Z"),
    },
    {
      id: "seed-fsbo-caner-002",
      title: "Gebze Kat Karşılığı İmarlı Arsa",
      price: 15_800_000,
      url: FSBO_URLS[6],
      source: "emlakjet",
      region: "Kocaeli/Gebze",
      il: "Kocaeli",
      ilce: "Gebze",
      location: "Hacıhalil, Gebze, Kocaeli",
      metrekare: 1_800,
      kategori: "ARSA",
      islemTipi: "SATILIK",
      description: "Geliştirici profiline uygun kat karşılığı parsel.",
      listedAt: noteAt("2026-05-27T16:00:00.000Z"),
    },
  ];

  for (const lead of leads) {
    await prisma.fsboLead.upsert({
      where: { url: lead.url },
      create: {
        ...lead,
        images: [image],
        specs: { m2: lead.metrekare, odaSayisi: lead.odaSayisi ?? null },
        agentId: null,
      },
      update: {
        ...lead,
        images: [image],
        isDiscarded: false,
        promotedDealId: null,
        agentId: null,
      },
    });
  }
}

async function seedClientsDeals() {
  const muratClient = await prisma.client.upsert({
    where: { id: IDS.clients.murat },
    create: {
      id: IDS.clients.murat,
      adSoyad: "Murat Korkmaz",
      telefon: "0532 410 22 18",
      email: "murat.korkmaz@email.com",
      kaynak: "Referans",
      butce: "8.500.000 TL",
      mulkTipi: "Gölcük / Başiskele imarlı arsa",
      notlar: "Yatırımcı profili — imarlı veya yatırımlık arsa arayışında.",
    },
    update: {
      adSoyad: "Murat Korkmaz",
      telefon: "0532 410 22 18",
      email: "murat.korkmaz@email.com",
      kaynak: "Referans",
      butce: "8.500.000 TL",
      mulkTipi: "Gölcük / Başiskele imarlı arsa",
      notlar: "Yatırımcı profili — imarlı veya yatırımlık arsa arayışında.",
    },
  });

  const selinClient = await prisma.client.upsert({
    where: { id: IDS.clients.selin },
    create: {
      id: IDS.clients.selin,
      adSoyad: "Selin Yılmaz",
      telefon: "0533 902 44 71",
      email: "selin.yilmaz@email.com",
      kaynak: "Emlakjet",
      butce: "6.200.000 TL",
      mulkTipi: "Başiskele sahil / merkez 3+1 sıfır daire",
      notlar: "Son kullanıcı — geniş balkonlu 3+1 öncelikli.",
    },
    update: {
      adSoyad: "Selin Yılmaz",
      telefon: "0533 902 44 71",
      email: "selin.yilmaz@email.com",
      kaynak: "Emlakjet",
      butce: "6.200.000 TL",
      mulkTipi: "Başiskele sahil / merkez 3+1 sıfır daire",
      notlar: "Son kullanıcı — geniş balkonlu 3+1 öncelikli.",
    },
  });

  const canerClient = await prisma.client.upsert({
    where: { id: IDS.clients.caner },
    create: {
      id: IDS.clients.caner,
      adSoyad: "Caner Yıldız",
      telefon: "0535 778 33 09",
      email: "caner.yildiz@email.com",
      kaynak: "LinkedIn",
      butce: "15.000.000 TL",
      mulkTipi: "Kat karşılığı / Ticari — Kocaeli",
      notlar: "Ticari geliştirici — kat karşılığı ve kupon yer arayışı.",
    },
    update: {
      adSoyad: "Caner Yıldız",
      telefon: "0535 778 33 09",
      email: "caner.yildiz@email.com",
      kaynak: "LinkedIn",
      butce: "15.000.000 TL",
      mulkTipi: "Kat karşılığı / Ticari — Kocaeli",
      notlar: "Ticari geliştirici — kat karşılığı ve kupon yer arayışı.",
    },
  });

  const muratProperty = await prisma.property.upsert({
    where: { id: IDS.properties.murat },
    create: {
      id: IDS.properties.murat,
      ilanBasligi: "Gölcük Oluklu İmarlı Arsa Fırsatı",
      fiyat: 8_500_000,
      il: "Kocaeli",
      ilce: "Gölcük",
      mahalle: "Oluklu",
      metrekare: 1_250,
      durum: PropertyListingStatus.SATILIK,
      tur: PropertyOwnershipType.FSBO,
    },
    update: {
      ilanBasligi: "Gölcük Oluklu İmarlı Arsa Fırsatı",
      fiyat: 8_500_000,
      il: "Kocaeli",
      ilce: "Gölcük",
      mahalle: "Oluklu",
      metrekare: 1_250,
    },
  });

  const selinProperty = await prisma.property.upsert({
    where: { id: IDS.properties.selin },
    create: {
      id: IDS.properties.selin,
      ilanBasligi: "Başiskele Sahil 3+1 Sıfır Daire",
      fiyat: 6_200_000,
      il: "Kocaeli",
      ilce: "Başiskele",
      mahalle: "Kirazpınar",
      metrekare: 142,
      odaSayisi: "3+1",
      durum: PropertyListingStatus.SATILIK,
      tur: PropertyOwnershipType.YETKILI,
    },
    update: {
      ilanBasligi: "Başiskele Sahil 3+1 Sıfır Daire",
      fiyat: 6_200_000,
      il: "Kocaeli",
      ilce: "Başiskele",
      mahalle: "Kirazpınar",
      metrekare: 142,
      odaSayisi: "3+1",
    },
  });

  const canerProperty = await prisma.property.upsert({
    where: { id: IDS.properties.caner },
    create: {
      id: IDS.properties.caner,
      ilanBasligi: "Kocaeli Ticari İmarlı Kupon Yer",
      fiyat: 15_000_000,
      il: "Kocaeli",
      ilce: "İzmit",
      mahalle: "Sanayi",
      metrekare: 620,
      durum: PropertyListingStatus.SATILIK,
      tur: PropertyOwnershipType.FSBO,
    },
    update: {
      ilanBasligi: "Kocaeli Ticari İmarlı Kupon Yer",
      fiyat: 15_000_000,
      il: "Kocaeli",
      ilce: "İzmit",
      mahalle: "Sanayi",
      metrekare: 620,
    },
  });

  const muratDeal = await prisma.deal.upsert({
    where: { id: IDS.deals.murat },
    create: {
      id: IDS.deals.murat,
      stage: DealStage.OFFER,
      clientId: muratClient.id,
      propertyId: muratProperty.id,
      etiket: "Yatırım",
      sonIletisim: "1 gün önce",
      budgetTL: 8_500_000,
      agentId: null,
      listingUrl: FSBO_URLS[0],
      listingIntel: {
        fiyat: "8.200.000 TL",
        ilanTarihi: "28.05.2026",
        metrekare: "1.250 m²",
        source: "sahibinden",
        title: "Gölcük Oluklu Acil Satılık İmarlı Arsa",
        location: "Oluklu Köyü, Gölcük, Kocaeli",
      },
      tasks: [
        {
          id: "murat-task-1",
          label: "Belediyeden imar durumu soruldu",
          completed: true,
        },
        {
          id: "murat-task-2",
          label: "Hissedarlarla görüşüldü",
          completed: true,
        },
        {
          id: "murat-task-3",
          label: "Resmi teklif mektubu iletildi",
          completed: true,
        },
        {
          id: "murat-task-4",
          label: "Tapu masrafları hesaplanacak",
          completed: false,
        },
      ],
    },
    update: {
      stage: DealStage.OFFER,
      clientId: muratClient.id,
      propertyId: muratProperty.id,
      etiket: "Yatırım",
      sonIletisim: "1 gün önce",
      budgetTL: 8_500_000,
      agentId: null,
      listingUrl: FSBO_URLS[0],
      listingIntel: {
        fiyat: "8.200.000 TL",
        ilanTarihi: "28.05.2026",
        metrekare: "1.250 m²",
        source: "sahibinden",
        title: "Gölcük Oluklu Acil Satılık İmarlı Arsa",
        location: "Oluklu Köyü, Gölcük, Kocaeli",
      },
      tasks: [
        {
          id: "murat-task-1",
          label: "Belediyeden imar durumu soruldu",
          completed: true,
        },
        {
          id: "murat-task-2",
          label: "Hissedarlarla görüşüldü",
          completed: true,
        },
        {
          id: "murat-task-3",
          label: "Resmi teklif mektubu iletildi",
          completed: true,
        },
        {
          id: "murat-task-4",
          label: "Tapu masrafları hesaplanacak",
          completed: false,
        },
      ],
    },
  });

  const selinDeal = await prisma.deal.upsert({
    where: { id: IDS.deals.selin },
    create: {
      id: IDS.deals.selin,
      stage: DealStage.SHOWING,
      clientId: selinClient.id,
      propertyId: selinProperty.id,
      etiket: "Krediye Uygun",
      sonIletisim: "3 saat önce",
      budgetTL: 6_200_000,
      agentId: null,
      listingUrl: FSBO_URLS[3],
      listingIntel: {
        fiyat: "5.950.000 TL",
        ilanTarihi: "03.06.2026",
        metrekare: "142 m²",
        source: "emlakjet",
        title: "Başiskele Sahil 3+1 Sıfır Daire — Geniş Balkon",
        location: "Kirazpınar Sahil, Başiskele, Kocaeli",
      },
      tasks: [
        {
          id: "selin-task-1",
          label: "Kredi uygunluk durumu sorgulandı",
          completed: true,
        },
        {
          id: "selin-task-2",
          label: "Cumartesi günü saat 14:00 yer gösterme randevusu",
          completed: false,
        },
        {
          id: "selin-task-3",
          label: "Mal sahibiyle pazarlık marjı konuşulacak",
          completed: false,
        },
      ],
    },
    update: {
      stage: DealStage.SHOWING,
      clientId: selinClient.id,
      propertyId: selinProperty.id,
      etiket: "Krediye Uygun",
      sonIletisim: "3 saat önce",
      budgetTL: 6_200_000,
      agentId: null,
      listingUrl: FSBO_URLS[3],
      listingIntel: {
        fiyat: "5.950.000 TL",
        ilanTarihi: "03.06.2026",
        metrekare: "142 m²",
        source: "emlakjet",
        title: "Başiskele Sahil 3+1 Sıfır Daire — Geniş Balkon",
        location: "Kirazpınar Sahil, Başiskele, Kocaeli",
      },
      tasks: [
        {
          id: "selin-task-1",
          label: "Kredi uygunluk durumu sorgulandı",
          completed: true,
        },
        {
          id: "selin-task-2",
          label: "Cumartesi günü saat 14:00 yer gösterme randevusu",
          completed: false,
        },
        {
          id: "selin-task-3",
          label: "Mal sahibiyle pazarlık marjı konuşulacak",
          completed: false,
        },
      ],
    },
  });

  const canerDeal = await prisma.deal.upsert({
    where: { id: IDS.deals.caner },
    create: {
      id: IDS.deals.caner,
      stage: DealStage.LEAD,
      clientId: canerClient.id,
      propertyId: canerProperty.id,
      etiket: "FSBO",
      sonIletisim: "5 gün önce",
      budgetTL: 15_000_000,
      agentId: null,
      tasks: [
        {
          id: "caner-task-1",
          label: "Brifing dosyası hazırlanacak",
          completed: false,
        },
        {
          id: "caner-task-2",
          label: "Yüz yüze kahve randevusu ayarlanacak",
          completed: false,
        },
      ],
    },
    update: {
      stage: DealStage.LEAD,
      clientId: canerClient.id,
      propertyId: canerProperty.id,
      etiket: "FSBO",
      sonIletisim: "5 gün önce",
      budgetTL: 15_000_000,
      agentId: null,
      tasks: [
        {
          id: "caner-task-1",
          label: "Brifing dosyası hazırlanacak",
          completed: false,
        },
        {
          id: "caner-task-2",
          label: "Yüz yüze kahve randevusu ayarlanacak",
          completed: false,
        },
      ],
    },
  });

  await prisma.dealNote.deleteMany({
    where: { dealId: { in: [muratDeal.id, selinDeal.id, canerDeal.id] } },
  });

  await prisma.dealNote.createMany({
    data: [
      {
        dealId: muratDeal.id,
        content:
          "Parsel OS imar askı takibinden Oluklu köyündeki parsel incelendi, bütçesine tam uyuyor.",
        olusturulmaTarihi: noteAt("2026-06-02T09:15:00.000Z"),
      },
      {
        dealId: selinDeal.id,
        content:
          "Emlakjet'teki bir ilan için randevu alındı, eşiyle birlikte gelecekler.",
        olusturulmaTarihi: noteAt("2026-06-05T11:30:00.000Z"),
      },
    ],
  });

  return { muratDeal, selinDeal, canerDeal };
}

async function main() {
  console.log("🌱 ParselOS demo pipeline seed başlıyor…");
  await clearPreviousSeed();
  await seedFsboLeads();
  const deals = await seedClientsDeals();
  console.log("✅ 3 müşteri, 3 fırsat ve 7 FSBO ilanı yüklendi.");
  console.log("   → /deals ve /musteriler sayfalarını yenileyin.");
  console.log(
    `   Fırsatlar: ${deals.muratDeal.id}, ${deals.selinDeal.id}, ${deals.canerDeal.id}`,
  );
}

main()
  .catch((error) => {
    console.error("Seed hatası:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
