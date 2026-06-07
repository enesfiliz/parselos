import {
  formatFullTRY,
  resolveDealBudgetTL,
  type DealCardData,
} from "@/lib/types/deal";

const FEMALE_FIRST_NAMES = new Set([
  "elif",
  "ayşe",
  "ayşe",
  "selin",
  "zeynep",
  "fatma",
  "hatice",
  "emine",
  "merve",
  "esra",
  "büşra",
  "buşra",
  "derya",
  "gül",
  "gul",
  "seda",
  "pınar",
  "pinar",
  "ceren",
  "deniz",
]);

export type WhatsAppTemplateId =
  | "post-showing"
  | "price-drop"
  | "deed-request";

export type WhatsAppTemplate = {
  id: WhatsAppTemplateId;
  label: string;
  preview: string;
  buildMessage: (ctx: DealMessageContext) => string;
};

export type DealMessageContext = {
  salutation: string;
  listingTitle: string;
  budgetFormatted: string;
};

export function normalizeWhatsAppPhone(phone: string | null): string | null {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `9${digits}`;
  return `90${digits}`;
}

export function buildWhatsAppUrl(phone: string | null, message: string): string | null {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function clientSalutation(adSoyad: string): string {
  const first = adSoyad.trim().split(/\s+/)[0] ?? adSoyad;
  const honorific = FEMALE_FIRST_NAMES.has(first.toLocaleLowerCase("tr-TR"))
    ? "Hanım"
    : "Bey";
  return `${first} ${honorific}`;
}

export function resolveListingTitle(deal: DealCardData): string {
  return (
    deal.listingIntel?.title?.trim() ||
    deal.property.ilanBasligi?.trim() ||
    "portföyümüzdeki ilan"
  );
}

export function resolveBudgetForMessage(deal: DealCardData): string {
  const budgetTL = resolveDealBudgetTL(deal);
  if (budgetTL > 0) {
    return new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 0,
    }).format(budgetTL);
  }

  const fromClient = deal.client.butce?.replace(/[^\d]/g, "");
  if (fromClient) {
    const parsed = Number(fromClient);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return new Intl.NumberFormat("tr-TR", {
        maximumFractionDigits: 0,
      }).format(parsed);
    }
  }

  return formatFullTRY(0).replace(/[^\d.,]/g, "") || "—";
}

export function buildDealMessageContext(deal: DealCardData): DealMessageContext {
  return {
    salutation: clientSalutation(deal.client.adSoyad),
    listingTitle: resolveListingTitle(deal),
    budgetFormatted: resolveBudgetForMessage(deal),
  };
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "post-showing",
    label: "Sunum Sonrası",
    preview: "Gezdiğimiz ilan için düşünceleriniz netleşti mi?",
    buildMessage: ({ salutation, listingTitle }) =>
      `${salutation} merhaba, bugün gezdiğimiz ${listingTitle} için düşünceleriniz netleşti mi?`,
  },
  {
    id: "price-drop",
    label: "Fiyat Düşüşü",
    preview: "Portföyde fiyat güncellendi — kaçırmayın.",
    buildMessage: ({ salutation, listingTitle, budgetFormatted }) =>
      `${salutation}, ilgilendiğiniz ${listingTitle} portföyünde fiyat ${budgetFormatted} TL seviyesine güncellendi. Kaçırmanızı istemem.`,
  },
  {
    id: "deed-request",
    label: "Tapu/Evrak İstemi",
    preview: "Kimlik fotoğrafı talebi",
    buildMessage: () =>
      "İşlemleri başlatabilmemiz için kimlik fotoğrafınızı iletebilir misiniz?",
  },
];

export function buildTemplateWhatsAppUrl(
  deal: DealCardData,
  templateId: WhatsAppTemplateId,
): string | null {
  const template = WHATSAPP_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return null;

  const ctx = buildDealMessageContext(deal);
  const message = template.buildMessage(ctx);
  return buildWhatsAppUrl(deal.client.telefon, message);
}

export function buildBuyerListingMatchMessage(
  deal: DealCardData,
  buyerName: string,
): string {
  const salutation = clientSalutation(buyerName);
  const title = resolveListingTitle(deal);
  const price = resolveBudgetForMessage(deal);
  const location =
    deal.listingIntel?.location ??
    [deal.property.ilce, deal.property.il].filter(Boolean).join(", ");
  const link = deal.listingUrl ?? "";

  const lines = [
    `${salutation} merhaba,`,
    "",
    "Aradığınız kriterlere uygun yeni bir ilan bulduk:",
    "",
    `📍 ${title}`,
    location ? `Konum: ${location}` : null,
    `💰 Fiyat: ${price} TL`,
    link ? `🔗 İlan: ${link}` : null,
    "",
    "Detayları inceleyip uygunsa yer gösterimi planlayalım mı?",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}

export function buildOwnerOutreachMessage(deal: DealCardData): string {
  const title = resolveListingTitle(deal);
  const price = resolveBudgetForMessage(deal);
  const link = deal.listingUrl ?? "";

  const lines = [
    "Merhaba,",
    "",
    "İlanınızla ilgileniyoruz. Müşterilerimize sunmak üzere detayları teyit etmek istiyoruz:",
    "",
    title,
    `Fiyat: ${price} TL`,
    link ? link : null,
    "",
    "Uygun bir zamanda görüşebilir miyiz?",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}

export function buildBuyerMatchWhatsAppUrl(deal: DealCardData): string | null {
  const buyer = deal.buyerMatch;
  if (!buyer?.telefon) return null;

  const message = buildBuyerListingMatchMessage(deal, buyer.adSoyad);
  return buildWhatsAppUrl(buyer.telefon, message);
}

export function buildOwnerWhatsAppUrl(deal: DealCardData): string {
  const message = buildOwnerOutreachMessage(deal);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
