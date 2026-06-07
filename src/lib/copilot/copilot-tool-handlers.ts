import "server-only";

import type { AppointmentType, CalendarAppointment } from "@/lib/calendar/appointments";
import { APPOINTMENT_TYPE_META, toDateKey } from "@/lib/calendar/appointments";
import { MOCK_DEALS } from "@/lib/data/mock-deals";
import { agentOwnershipFilter } from "@/lib/auth/agent";
import { getAuthorizedPortfolios } from "@/lib/portfolios/authorized-portfolios";
import { prisma } from "@/lib/prisma";
import type { TenantPlanType } from "@prisma/client";

export type SubscriptionPlan = "starter" | "pro" | "premium";

export type WhatsAppUrgency = "Normal" | "Acil";

const PLAN_LIMITS: Record<
  SubscriptionPlan,
  { label: string; portfolioLimit: number; dealLimit: number; aiCredits: number }
> = {
  starter: {
    label: "Başlangıç",
    portfolioLimit: 10,
    dealLimit: 25,
    aiCredits: 50,
  },
  pro: {
    label: "Pro",
    portfolioLimit: 50,
    dealLimit: 150,
    aiCredits: 500,
  },
  premium: {
    label: "Premium",
    portfolioLimit: 200,
    dealLimit: 500,
    aiCredits: 2000,
  },
};

const copilotScheduledAppointments: CalendarAppointment[] = [];

function formatTRY(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function mapTenantPlanToSubscription(planType: TenantPlanType): SubscriptionPlan {
  switch (planType) {
    case "PREMIUM":
      return "premium";
    case "PRO":
      return "pro";
    default:
      return "starter";
  }
}

export async function resolveSubscriptionPlanForAgent(
  agentId: string,
): Promise<SubscriptionPlan> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { tenant: true },
  });

  if (!agent?.tenant) {
    return "starter";
  }

  return mapTenantPlanToSubscription(agent.tenant.planType);
}

function normalizeAppointmentType(value: string): AppointmentType {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "showing" ||
    normalized.includes("göster") ||
    normalized.includes("goster")
  ) {
    return "showing";
  }

  if (
    normalized === "deed" ||
    normalized.includes("tapu")
  ) {
    return "deed";
  }

  return "meeting";
}

function parseAppointmentDate(value: string): string {
  const trimmed = value.trim();

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const trMatch = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (trMatch) {
    const day = trMatch[1].padStart(2, "0");
    const month = trMatch[2].padStart(2, "0");
    return `${trMatch[3]}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return toDateKey(parsed);
  }

  return toDateKey(new Date());
}

export async function getPortfolioSummaryForAgent(agentId: string) {
  const portfolios = await getAuthorizedPortfolios();

  let pendingDeals: Array<{
    id: string;
    stage: string;
    clientName: string;
    propertyTitle: string;
    budgetTL: number;
  }> = [];

  try {
    const deals = await prisma.deal.findMany({
      where: {
        ...agentOwnershipFilter(agentId),
        stage: { in: ["LEAD", "SHOWING", "OFFER"] },
      },
      include: {
        client: { select: { adSoyad: true } },
        property: { select: { ilanBasligi: true, fiyat: true } },
      },
      orderBy: { guncellenmeTarihi: "desc" },
      take: 20,
    });

    pendingDeals = deals.map((deal) => ({
      id: deal.id,
      stage: deal.stage,
      clientName: deal.client.adSoyad,
      propertyTitle: deal.property.ilanBasligi,
      budgetTL:
        deal.budgetTL ??
        (deal.property.fiyat ? Number(deal.property.fiyat) : 0),
    }));
  } catch {
    pendingDeals = MOCK_DEALS.filter((deal) =>
      ["LEAD", "SHOWING", "OFFER"].includes(deal.stage),
    ).map((deal) => ({
      id: deal.id,
      stage: deal.stage,
      clientName: deal.client.adSoyad,
      propertyTitle: deal.property.ilanBasligi,
      budgetTL: deal.budgetTL ?? 0,
    }));
  }

  if (pendingDeals.length === 0) {
    pendingDeals = MOCK_DEALS.filter((deal) =>
      ["LEAD", "SHOWING", "OFFER"].includes(deal.stage),
    ).map((deal) => ({
      id: deal.id,
      stage: deal.stage,
      clientName: deal.client.adSoyad,
      propertyTitle: deal.property.ilanBasligi,
      budgetTL: deal.budgetTL ?? 0,
    }));
  }

  const totalPortfolioVolumeTL = portfolios.reduce(
    (sum, item) => sum + item.priceTL,
    0,
  );
  const pendingPipelineVolumeTL = pendingDeals.reduce(
    (sum, item) => sum + item.budgetTL,
    0,
  );

  const stageBreakdown = pendingDeals.reduce<Record<string, number>>(
    (acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return {
    activePortfolioCount: portfolios.length,
    totalPortfolioVolumeTL,
    totalPortfolioVolumeFormatted: formatTRY(totalPortfolioVolumeTL),
    pendingDealCount: pendingDeals.length,
    pendingPipelineVolumeTL,
    pendingPipelineVolumeFormatted: formatTRY(pendingPipelineVolumeTL),
    stageBreakdown,
    topPortfolios: portfolios.slice(0, 5).map((item) => ({
      title: item.title,
      location: item.location,
      priceFormatted: item.priceFormatted,
      listingType: item.listingType,
    })),
    recentPendingDeals: pendingDeals.slice(0, 5).map((deal) => ({
      clientName: deal.clientName,
      propertyTitle: deal.propertyTitle,
      stage: deal.stage,
      budgetFormatted: formatTRY(deal.budgetTL),
    })),
  };
}

export async function getSubscriptionInfoForAgent(
  agentId: string,
  wantsUpgrade?: boolean,
) {
  const currentPlan = await resolveSubscriptionPlanForAgent(agentId);
  const currentLimits = PLAN_LIMITS[currentPlan];
  const canUpgrade = currentPlan !== "premium";

  const planSummary =
    `**${currentLimits.label}** paketindesiniz.\n\n` +
    `- Aktif portföy limiti: **${currentLimits.portfolioLimit}**\n` +
    `- Fırsat (deal) limiti: **${currentLimits.dealLimit}**\n` +
    `- Aylık AI kredisi: **${currentLimits.aiCredits}**`;

  if (wantsUpgrade && canUpgrade) {
    return {
      success: true,
      currentPlan,
      planLabel: currentLimits.label,
      limits: currentLimits,
      canUpgrade: true,
      billingPath: "/billing",
      message:
        "Paket değişiklikleri güvenlik nedeniyle yalnızca fatura sayfasından yapılabilir.",
      markdown: `${planSummary}\n\n[Paketi Yükselt](/billing)`,
    };
  }

  if (wantsUpgrade && !canUpgrade) {
    return {
      success: true,
      currentPlan,
      planLabel: currentLimits.label,
      limits: currentLimits,
      canUpgrade: false,
      message: "Zaten en üst pakette (Premium) bulunuyorsunuz.",
      markdown: `${planSummary}\n\nEk yükseltme seçeneği bulunmuyor.`,
    };
  }

  return {
    success: true,
    currentPlan,
    planLabel: currentLimits.label,
    limits: currentLimits,
    canUpgrade,
    billingPath: canUpgrade ? "/billing" : null,
    message: `${currentLimits.label} paket bilgileriniz hazır.`,
    markdown: canUpgrade
      ? `${planSummary}\n\nPaket yükseltmek için: [Paketi Yükselt](/billing)`
      : planSummary,
  };
}

type RegionalMarketProfile = {
  demandLevel: "yüksek" | "orta" | "düşük";
  pricePerSqm: number;
  trend: string;
  buyerProfile: string;
};

const REGIONAL_PROFILES: Array<{
  match: RegExp;
  profile: RegionalMarketProfile;
}> = [
  {
    match: /gölcük|golcuk/i,
    profile: {
      demandLevel: "yüksek",
      pricePerSqm: 28_500,
      trend: "Sanayi ve konut talebi paralel büyüyor; merkez ve sahil hattı öne çıkıyor.",
      buyerProfile: "Aileler ve yatırımcılar; ulaşım aksına yakın konutlar hızlı dönüyor.",
    },
  },
  {
    match: /söğüt|sogut|bilecik/i,
    profile: {
      demandLevel: "orta",
      pricePerSqm: 12_800,
      trend: "Tarım ve turizm potansiyeliyle arsa talebi artıyor; köy yerleşimleri ilgi görüyor.",
      buyerProfile: "İkinci konut ve arazi yatırımcıları; doğa ve sakin yaşam arayan profil.",
    },
  },
  {
    match: /izmit|kocaeli/i,
    profile: {
      demandLevel: "yüksek",
      pricePerSqm: 42_000,
      trend: "Şehir merkezi ve ulaşım koridorlarında fiyatlar stabil; kiralık talep güçlü.",
      buyerProfile: "Genç profesyoneller ve yatırımcılar; metro/otobüs hattına yakınlık kritik.",
    },
  },
  {
    match: /gebze/i,
    profile: {
      demandLevel: "yüksek",
      pricePerSqm: 35_000,
      trend: "OSB çevresi ticari talep canlı; konut segmentinde kiralık dönüş hızlı.",
      buyerProfile: "Çalışan aileler ve kısa vadeli kiralama yatırımcıları.",
    },
  },
];

const DEFAULT_REGIONAL_PROFILE: RegionalMarketProfile = {
  demandLevel: "orta",
  pricePerSqm: 22_000,
  trend: "Bölgesel talep dengeli; doğru fiyatlandırma ve profesyonel sunum satış süresini kısaltır.",
  buyerProfile: "Yerel alıcılar ve bölge dışı yatırımcılar; güvenilir danışmanlık arıyor.",
};

function resolveRegionalProfile(location: string): RegionalMarketProfile {
  const hit = REGIONAL_PROFILES.find((entry) => entry.match.test(location));
  return hit?.profile ?? DEFAULT_REGIONAL_PROFILE;
}

function honorificName(customerName: string) {
  const trimmed = customerName.trim();
  const first = trimmed.split(/\s+/)[0] ?? "Sayın Müşterimiz";
  if (first.endsWith("Bey") || first.endsWith("Hanım")) return first;
  return `${first} Bey`;
}

function buildWhatsAppBody(
  customerName: string,
  topic: string,
  urgency: WhatsAppUrgency,
) {
  const honorific = honorificName(customerName);
  const topicLower = topic.toLowerCase();
  const urgentPrefix =
    urgency === "Acil" ? "Kısa bir hatırlatma: " : "";

  if (
    topicLower.includes("randevu") ||
    topicLower.includes("tapu") ||
    topicLower.includes("göster")
  ) {
    return (
      `${urgentPrefix}Merhaba ${honorific}, ` +
      `${topic} konusunda sizinle iletişimde kalmak istedim. ` +
      `Uygun olduğunuz saati paylaşırsanız takvimi hemen netleştirelim. ` +
      `Her türlü sorunuz için buradayım — ParselOS.`
    );
  }

  if (
    topicLower.includes("portföy") ||
    topicLower.includes("sunum") ||
    topicLower.includes("ilan")
  ) {
    return (
      `${urgentPrefix}Merhaba ${honorific}, ` +
      `size özel hazırladığımız yeni portföy seçeneklerini paylaşmak istiyorum. ` +
      `${topic} kapsamında bütçenize ve beklentinize uygun fırsatlar mevcut. ` +
      `Detayları konuşmak için müsait olduğunuzda haber vermeniz yeterli.`
    );
  }

  if (
    topicLower.includes("fiyat") ||
    topicLower.includes("indirim") ||
    topicLower.includes("kampanya")
  ) {
    return (
      `${urgentPrefix}Merhaba ${honorific}, ` +
      `takip ettiğiniz mülk için güncel piyasa koşullarına uygun avantajlı bir fiyat güncellemesi var. ` +
      `${topic} fırsatını kaçırmamanızı öneririm. ` +
      `İlgilenirseniz bugün kısa bir görüşme planlayabiliriz.`
    );
  }

  return (
    `${urgentPrefix}Merhaba ${honorific}, ` +
    `${topic} hakkında sizinle iletişimde olmak istedim. ` +
    `Size en uygun çözümü birlikte netleştirebiliriz. ` +
    `Dönüşünüzü bekliyorum, iyi günler dilerim.`
  );
}

export function generateWhatsAppMessageForAgent(
  customerName: string,
  topic: string,
  urgency: WhatsAppUrgency,
) {
  const messageText = buildWhatsAppBody(customerName, topic, urgency);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  return {
    success: true,
    customerName: customerName.trim(),
    topic,
    urgency,
    messageText,
    whatsappUrl,
    markdown:
      `**WhatsApp Mesajı**\n\n` +
      `> ${messageText.replace(/\n/g, "\n> ")}\n\n` +
      `[WhatsApp'ta Gönder](${whatsappUrl})`,
  };
}

function normalizePropertyKind(propertyType: string): "arsa" | "daire" | "diger" {
  const value = propertyType.trim().toLowerCase();
  if (value.includes("arsa") || value.includes("arazi") || value.includes("parsel")) {
    return "arsa";
  }
  if (
    value.includes("daire") ||
    value.includes("konut") ||
    value.includes("villa")
  ) {
    return "daire";
  }
  return "diger";
}

function buildListingTitle(
  location: string,
  propertyType: string,
  size: number,
) {
  const kind = normalizePropertyKind(propertyType);
  if (kind === "arsa") {
    return `🌿 ${location} — ${size} m² İmarlı / Yatırımlık Arsa`;
  }
  if (kind === "daire") {
    return `🏡 ${location} — ${size} m² Satılık Daire`;
  }
  return `✨ ${location} — ${size} m² ${propertyType}`;
}

export function analyzePropertyForAgent(
  location: string,
  propertyType: string,
  size: number,
  keyFeatures: string[],
) {
  const profile = resolveRegionalProfile(location);
  const kind = normalizePropertyKind(propertyType);
  const featureList =
    keyFeatures.length > 0
      ? keyFeatures.map((f) => f.trim()).filter(Boolean)
      : ["Merkeze yakın konum", "Yatırım potansiyeli", "Temiz tapu"];

  const basePrice = profile.pricePerSqm * size;
  const demandMultiplier =
    profile.demandLevel === "yüksek"
      ? 1.08
      : profile.demandLevel === "orta"
        ? 1.0
        : 0.92;
  const kindMultiplier = kind === "arsa" ? 0.85 : kind === "daire" ? 1.05 : 1.0;

  const suggestedPrice = Math.round(basePrice * demandMultiplier * kindMultiplier);
  const minPrice = Math.round(suggestedPrice * 0.94);
  const maxPrice = Math.round(suggestedPrice * 1.06);

  const marketSummary = [
    `📈 **Talep seviyesi:** ${profile.demandLevel.charAt(0).toUpperCase()}${profile.demandLevel.slice(1)} — ${profile.trend}`,
    `💰 **Rekabetçi fiyat aralığı:** ${formatTRY(minPrice)} – ${formatTRY(maxPrice)} (m² baz: ~${formatTRY(Math.round(profile.pricePerSqm))})`,
    `🎯 **Alıcı profili:** ${profile.buyerProfile}`,
  ];

  const title = buildListingTitle(location, propertyType, size);
  const featureBlock = featureList.map((f) => `✅ ${f}`).join("\n");

  const listingText =
    `${title}\n\n` +
    `📍 **Konum:** ${location}\n` +
    `📐 **Alan:** ${size} m² | **Tür:** ${propertyType}\n\n` +
    `🔑 **Öne Çıkanlar**\n${featureBlock}\n\n` +
    `Bu mülk; ${location} bölgesindeki güncel piyasa dinamikleriyle uyumlu, ` +
    `hem oturum hem yatırım için güçlü bir seçenek sunuyor. ` +
    `Detaylı bilgi ve yerinde gösterim için hemen iletişime geçin.\n\n` +
    `💎 ParselOS güvencesiyle listelenmiştir.`;

  return {
    success: true,
    location,
    propertyType,
    size,
    keyFeatures: featureList,
    demandLevel: profile.demandLevel,
    suggestedPriceTL: suggestedPrice,
    suggestedPriceFormatted: formatTRY(suggestedPrice),
    priceRange: {
      minTL: minPrice,
      maxTL: maxPrice,
      minFormatted: formatTRY(minPrice),
      maxFormatted: formatTRY(maxPrice),
    },
    marketSummary,
    listingText,
    markdown:
      `### Piyasa Özeti\n\n` +
      `${marketSummary.join("\n\n")}\n\n` +
      `### İlan Metni (kopyala-yapıştır)\n\n` +
      listingText,
  };
}

export function scheduleAppointmentForAgent(
  agentId: string,
  customerName: string,
  date: string,
  appointmentType: string,
) {
  const normalizedType = normalizeAppointmentType(appointmentType);
  const dateKey = parseAppointmentDate(date);
  const typeMeta = APPOINTMENT_TYPE_META[normalizedType];

  const appointment: CalendarAppointment = {
    id: `copilot-apt-${agentId.slice(0, 8)}-${Date.now()}`,
    date: dateKey,
    time: "10:00",
    type: normalizedType,
    clientName: customerName.trim(),
    clientPhone: "",
    propertyTitle: `${typeMeta.label} — ${customerName.trim()}`,
  };

  copilotScheduledAppointments.unshift(appointment);

  return {
    success: true,
    appointmentId: appointment.id,
    customerName: appointment.clientName,
    date: appointment.date,
    time: appointment.time,
    appointmentType: normalizedType,
    appointmentTypeLabel: typeMeta.label,
    message: `${appointment.clientName} için ${appointment.date} tarihinde ${typeMeta.label} randevusu planlandı.`,
  };
}

export function listCopilotScheduledAppointments() {
  return [...copilotScheduledAppointments];
}
