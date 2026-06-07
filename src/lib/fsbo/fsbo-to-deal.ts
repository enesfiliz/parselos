import type { FsboLeadData } from "@/lib/types/fsbo-lead";
import type { DealCardData } from "@/lib/types/deal";

export type FsboPromoteClientPick = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  butce: string | null;
  mulkTipi: string | null;
};

export function promoteMockFsboLeadToClient(
  lead: FsboLeadData,
  client: FsboPromoteClientPick,
): {
  lead: FsboLeadData;
  deal: DealCardData;
} {
  const deal = fsboLeadToDealCard(lead);

  return {
    lead: {
      ...lead,
      isRead: true,
      promotedDealId: deal.id,
    },
    deal: {
      ...deal,
      client: {
        id: client.id,
        adSoyad: client.adSoyad,
        telefon: client.telefon,
        email: null,
        kaynak: "FSBO Radarı",
        butce: client.butce ?? deal.client.butce,
        mulkTipi: client.mulkTipi ?? deal.client.mulkTipi,
      },
      notlar: `FSBO Radarı → ${client.adSoyad}\nKaynak: ${lead.source}\n${lead.url}`,
    },
  };
}

export function fsboLeadToDealCard(lead: FsboLeadData): DealCardData {
  const now = new Date().toISOString();
  const dealId = `mock-deal-fsbo-${lead.id.replace(/[^a-z0-9]/gi, "")}-${Date.now()}`;

  return {
    id: dealId,
    stage: "LEAD",
    notlar: `FSBO Radarı üzerinden pipeline'a alındı.\nKaynak: ${lead.source}\n${lead.url}`,
    olusturulmaTarihi: now,
    guncellenmeTarihi: now,
    etiket: "FSBO",
    sonIletisim: "Bugün",
    budgetTL: lead.price,
    listingUrl: lead.url,
    listingIntel: {
      fiyat: lead.priceFormatted,
      ilanTarihi: lead.listedAt
        ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(
            new Date(lead.listedAt),
          )
        : "—",
      metrekare: lead.metrekare ? `${lead.metrekare} m²` : "—",
      source: lead.source,
      title: lead.title,
      location: lead.location,
    },
    client: {
      id: `mock-client-placeholder`,
      adSoyad: "Müşteri Seçilmedi",
      telefon: null,
      email: null,
      kaynak: "FSBO Radarı",
      butce: lead.priceFormatted,
      mulkTipi: lead.odaSayisi
        ? `${lead.odaSayisi}, ${lead.ilce ?? lead.region}`
        : (lead.ilce ?? lead.region),
    },
    property: {
      id: `mock-prop-fsbo-${lead.id}`,
      ilanBasligi: lead.title,
      fiyat: lead.price ? String(lead.price) : null,
      il: lead.il ?? "Kocaeli",
      ilce: lead.ilce ?? lead.region,
      mahalle: lead.mahalle,
      ada: null,
      parsel: null,
      durum: "SATILIK",
      tur: "FSBO",
      odaSayisi: lead.odaSayisi,
      metrekare: lead.metrekare,
    },
  };
}
