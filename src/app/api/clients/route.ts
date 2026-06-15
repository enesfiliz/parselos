import { NextResponse } from "next/server";
import { DealStage } from "@prisma/client";

import { requireCurrentAgent } from "@/lib/auth/agent";
import {
  createStandaloneClientForAgent,
  clientsForAgentWhere,
} from "@/lib/clients/server-queries";
import { prisma } from "@/lib/prisma";

const ACTIVE_DEAL_STAGES: DealStage[] = ["LEAD", "SHOWING", "OFFER"];

interface CreateClientBody {
  adSoyad?: string;
  telefon?: string;
  email?: string;
  notlar?: string;
  kaynak?: string;
  birthDate?: string | null;
  butce?: string;
  mulkTipi?: string;
  /** Mevcut agent-owned deal — client bu fırsata bağlanır (ownership). */
  dealId?: string;
}

type ClientRecord = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
  kaynak: string | null;
  birthDate: Date | null;
  butce: string | null;
  mulkTipi: string | null;
  olusturulmaTarihi: Date;
  guncellenmeTarihi: Date;
  _count?: {
    deals: number;
  };
};

function serializeClient(client: ClientRecord) {
  return {
    id: client.id,
    adSoyad: client.adSoyad,
    telefon: client.telefon,
    email: client.email,
    notlar: client.notlar,
    kaynak: client.kaynak,
    birthDate: client.birthDate?.toISOString() ?? null,
    butce: client.butce,
    mulkTipi: client.mulkTipi,
    olusturulmaTarihi: client.olusturulmaTarihi.toISOString(),
    guncellenmeTarihi: client.guncellenmeTarihi.toISOString(),
    aktifFirsatSayisi: client._count?.deals ?? 0,
  };
}

function parseBirthDate(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const dateInputMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateInputMatch) {
    const [, year, month, day] = dateInputMatch;
    const yearNumber = Number(year);
    const monthNumber = Number(month);
    const dayNumber = Number(day);
    const parsed = new Date(
      Date.UTC(yearNumber, monthNumber - 1, dayNumber),
    );

    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getUTCFullYear() !== yearNumber ||
      parsed.getUTCMonth() !== monthNumber - 1 ||
      parsed.getUTCDate() !== dayNumber
    ) {
      return null;
    }

    return parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET() {
  try {
    const agent = await requireCurrentAgent();

    const clients = await prisma.client.findMany({
      where: clientsForAgentWhere(agent.id),
      orderBy: { olusturulmaTarihi: "desc" },
      include: {
        _count: {
          select: {
            deals: {
              where: {
                agentId: agent.id,
                stage: { in: ACTIVE_DEAL_STAGES },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: clients.map(serializeClient) });
  } catch (error) {
    console.error("[GET /api/clients]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Müşteriler listelenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const agent = await requireCurrentAgent();

    const body = (await req.json()) as CreateClientBody;

    const dealId = body.dealId?.trim();

    const adSoyad = body.adSoyad?.trim();
    const telefon = body.telefon?.trim() || null;
    const email = body.email?.trim() || null;
    const notlar = body.notlar?.trim() || null;
    const kaynak = body.kaynak?.trim() || null;
    const birthDate = parseBirthDate(body.birthDate);
    const butce = body.butce?.trim() || null;
    const mulkTipi = body.mulkTipi?.trim() || null;

    if (!adSoyad) {
      return NextResponse.json(
        { error: "Müşteri adı soyadı zorunludur." },
        { status: 400 },
      );
    }

    if (adSoyad.startsWith("FSBO —")) {
      return NextResponse.json(
        { error: "İlan başlığı müşteri adı olarak kullanılamaz." },
        { status: 400 },
      );
    }

    const client = dealId
      ? await prisma.$transaction(async (tx) => {
          const deal = await tx.deal.findFirst({
            where: { id: dealId, agentId: agent.id },
            select: { id: true },
          });

          if (!deal) {
            throw new Error("DEAL_NOT_FOUND");
          }

          const created = await tx.client.create({
            data: {
              adSoyad,
              telefon,
              email,
              notlar,
              kaynak,
              birthDate,
              butce,
              mulkTipi,
            },
          });

          await tx.deal.update({
            where: { id: dealId },
            data: { clientId: created.id },
          });

          return created;
        })
      : await createStandaloneClientForAgent(agent.id, {
          adSoyad,
          telefon,
          email,
          notlar,
          kaynak,
          birthDate,
          butce,
          mulkTipi,
        });

    return NextResponse.json({ data: serializeClient(client) }, { status: 201 });
  } catch (error) {
    console.error("PRISMA KAYIT HATASI:", error);

    if (error instanceof Error && error.message === "DEAL_NOT_FOUND") {
      return NextResponse.json({ error: "Fırsat bulunamadı." }, { status: 404 });
    }

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const details = error instanceof Error ? error.message : "Bilinmeyen hata";

    return NextResponse.json(
      { error: "Kayıt başarısız", details },
      { status: 500 },
    );
  }
}
