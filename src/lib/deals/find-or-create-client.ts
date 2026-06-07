import "server-only";

import { prisma } from "@/lib/prisma";

export type ClientUpsertInput = {
  adSoyad: string;
  telefon?: string | null;
  kaynak?: string | null;
  butce?: string | null;
  mulkTipi?: string | null;
  notlar?: string | null;
};

export async function findOrCreateClient(input: ClientUpsertInput) {
  const adSoyad = input.adSoyad.trim();
  if (!adSoyad) {
    throw new Error("Müşteri adı zorunludur.");
  }

  const telefon = input.telefon?.trim() || null;
  const patch = {
    butce: input.butce?.trim() || null,
    mulkTipi: input.mulkTipi?.trim() || null,
    kaynak: input.kaynak?.trim() || null,
    notlar: input.notlar?.trim() || null,
  };

  if (telefon) {
    const byPhone = await prisma.client.findFirst({ where: { telefon } });
    if (byPhone) {
      return prisma.client.update({
        where: { id: byPhone.id },
        data: {
          butce: patch.butce ?? byPhone.butce,
          mulkTipi: patch.mulkTipi ?? byPhone.mulkTipi,
          kaynak: patch.kaynak ?? byPhone.kaynak,
          notlar: patch.notlar ?? byPhone.notlar,
        },
      });
    }
  }

  const byName = await prisma.client.findFirst({
    where: {
      adSoyad: { equals: adSoyad, mode: "insensitive" },
    },
  });

  if (byName) {
    return prisma.client.update({
      where: { id: byName.id },
      data: {
        telefon: telefon ?? byName.telefon,
        butce: patch.butce ?? byName.butce,
        mulkTipi: patch.mulkTipi ?? byName.mulkTipi,
        kaynak: patch.kaynak ?? byName.kaynak,
        notlar: patch.notlar ?? byName.notlar,
      },
    });
  }

  return prisma.client.create({
    data: {
      adSoyad,
      telefon,
      kaynak: patch.kaynak,
      butce: patch.butce,
      mulkTipi: patch.mulkTipi,
      notlar: patch.notlar,
    },
  });
}
