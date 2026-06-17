import "server-only";

import { prisma } from "@/lib/prisma";
import { clientsForAgentWhere } from "@/lib/clients/server-queries";
import type { CrmVoicePayload } from "@/lib/types/crm";

export type VoiceMatchConfidence = "strong" | "possible" | "new";

export type VoiceClientCandidate = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  butce: string | null;
  mulkTipi: string | null;
  confidence: VoiceMatchConfidence;
  reason: string;
};

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.slice(-10);
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

export async function findVoiceClientCandidates(
  agentId: string,
  payload: CrmVoicePayload,
): Promise<VoiceClientCandidate[]> {
  const phone = normalizePhone(payload.telefon ?? null) ??
    normalizePhone(
      payload.notlar.match(/(\+?90|0)?\s*5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/)?.[0] ??
        null,
    );
  const name = normalizeName(payload.musteri_adi);
  const where = clientsForAgentWhere(agentId);

  const clients = await prisma.client.findMany({
    where,
    orderBy: { guncellenmeTarihi: "desc" },
    take: 200,
    select: {
      id: true,
      adSoyad: true,
      telefon: true,
      butce: true,
      mulkTipi: true,
    },
  });

  const candidates: VoiceClientCandidate[] = [];

  for (const client of clients) {
    const clientPhone = normalizePhone(client.telefon);
    const clientName = normalizeName(client.adSoyad);

    if (phone && clientPhone && phone === clientPhone) {
      candidates.push({
        id: client.id,
        adSoyad: client.adSoyad,
        telefon: client.telefon,
        butce: client.butce,
        mulkTipi: client.mulkTipi,
        confidence: "strong",
        reason: "Telefon numarası eşleşiyor",
      });
      continue;
    }

    if (name.length >= 3 && clientName === name) {
      candidates.push({
        id: client.id,
        adSoyad: client.adSoyad,
        telefon: client.telefon,
        butce: client.butce,
        mulkTipi: client.mulkTipi,
        confidence: "possible",
        reason: "İsim benzerliği var — lütfen doğrulayın",
      });
      continue;
    }

    if (
      name.length >= 4 &&
      (clientName.includes(name) || name.includes(clientName))
    ) {
      candidates.push({
        id: client.id,
        adSoyad: client.adSoyad,
        telefon: client.telefon,
        butce: client.butce,
        mulkTipi: client.mulkTipi,
        confidence: "possible",
        reason: "Kısmi isim eşleşmesi — lütfen doğrulayın",
      });
    }
  }

  const ranked = candidates.sort((a, b) => {
    const order: Record<VoiceMatchConfidence, number> = {
      strong: 0,
      possible: 1,
      new: 2,
    };
    return order[a.confidence] - order[b.confidence];
  });

  return ranked.slice(0, 5);
}

export function confidenceLabel(confidence: VoiceMatchConfidence): string {
  switch (confidence) {
    case "strong":
      return "Güçlü eşleşme";
    case "possible":
      return "Olası eşleşme";
    default:
      return "Yeni kayıt";
  }
}
