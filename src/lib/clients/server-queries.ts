import "server-only";

import { DealStage } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveClientRegionAndType } from "@/lib/clients/portfolio-hints";

const ACTIVE_DEAL_STAGES: DealStage[] = ["LEAD", "SHOWING", "OFFER"];

export type CustomerListItem = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
  kaynak: string | null;
  butce: string | null;
  mulkTipi: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  aktifFirsatSayisi: number;
  region: string;
  propertyType: string;
};

export async function getCustomersList(): Promise<CustomerListItem[]> {
  const clients = await prisma.client.findMany({
    where: {
      NOT: {
        adSoyad: { startsWith: "FSBO —" },
      },
    },
    orderBy: { olusturulmaTarihi: "desc" },
    include: {
      _count: {
        select: {
          deals: {
            where: { stage: { in: ACTIVE_DEAL_STAGES } },
          },
        },
      },
    },
  });

  return clients.map((client) => {
    const { region, propertyType } = resolveClientRegionAndType(client.mulkTipi);

    return {
      id: client.id,
      adSoyad: client.adSoyad,
      telefon: client.telefon,
      email: client.email,
      notlar: client.notlar,
      kaynak: client.kaynak,
      butce: client.butce,
      mulkTipi: client.mulkTipi,
      olusturulmaTarihi: client.olusturulmaTarihi.toISOString(),
      guncellenmeTarihi: client.guncellenmeTarihi.toISOString(),
      aktifFirsatSayisi: client._count.deals,
      region,
      propertyType,
    };
  });
}
