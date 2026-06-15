import { NextResponse } from "next/server";

import { requireCurrentAgent } from "@/lib/auth/agent";
import {
  CLIENT_DELETE_DISABLED_ERROR,
  CLIENT_SHARED_MUTATION_ERROR,
  resolveClientAgentAccess,
} from "@/lib/clients/server-queries";
import { prisma } from "@/lib/prisma";

interface UpdateClientBody {
  adSoyad?: string;
  telefon?: string;
  email?: string;
  notlar?: string;
  kaynak?: string;
  birthDate?: string | null;
  butce?: string;
  mulkTipi?: string;
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
};

function serializeClient(client: ClientRecord) {
  return {
    ...client,
    birthDate: client.birthDate?.toISOString() ?? null,
    olusturulmaTarihi: client.olusturulmaTarihi.toISOString(),
    guncellenmeTarihi: client.guncellenmeTarihi.toISOString(),
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;
    const body = (await request.json()) as UpdateClientBody;

    const adSoyad = body.adSoyad?.trim();

    if (!adSoyad) {
      return NextResponse.json(
        { error: "Müşteri adı soyadı zorunludur." },
        { status: 400 },
      );
    }

    const access = await resolveClientAgentAccess(id, agent.id);

    if (access === "not_found" || access === "not_owned") {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    if (access === "shared") {
      return NextResponse.json({ error: CLIENT_SHARED_MUTATION_ERROR }, { status: 409 });
    }

    const existing = await prisma.client.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        adSoyad,
        telefon: body.telefon?.trim() || null,
        email: body.email?.trim() || null,
        notlar: body.notlar?.trim() || null,
        kaynak: body.kaynak?.trim() || null,
        birthDate:
          body.birthDate !== undefined
            ? parseBirthDate(body.birthDate)
            : existing.birthDate,
        butce:
          body.butce !== undefined ? body.butce?.trim() || null : existing.butce,
        mulkTipi:
          body.mulkTipi !== undefined
            ? body.mulkTipi?.trim() || null
            : existing.mulkTipi,
      },
    });

    return NextResponse.json({ data: serializeClient(client) });
  } catch (error) {
    console.error("[PATCH /api/clients/[id]]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Müşteri güncellenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;

    const access = await resolveClientAgentAccess(id, agent.id);

    if (access === "not_found" || access === "not_owned") {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(
      { error: CLIENT_DELETE_DISABLED_ERROR },
      { status: 409 },
    );
  } catch (error) {
    console.error("[DELETE /api/clients/[id]]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Müşteri silinirken bir hata oluştu." },
      { status: 500 },
    );
  }
}
