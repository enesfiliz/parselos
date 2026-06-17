import { NextResponse } from "next/server";

import { requireCurrentAgent } from "@/lib/auth/agent";
import {
  confidenceLabel,
  findVoiceClientCandidates,
} from "@/lib/voice-crm/client-matching";
import {
  applyVoiceLogAction,
  type VoiceApplyAction,
} from "@/lib/voice-crm/apply-actions";
import { getVoiceLogForAgent } from "@/lib/voice-crm/voice-log-store";
import type { CrmVoicePayload } from "@/lib/types/crm";

export const runtime = "nodejs";

const ACTIONS: VoiceApplyAction[] = [
  "create_client",
  "match_client",
  "update_client",
  "note_only",
  "later",
  "dismiss",
  "archive",
  "unarchive",
  "append_info",
];

function isApplyAction(value: unknown): value is VoiceApplyAction {
  return typeof value === "string" && ACTIONS.includes(value as VoiceApplyAction);
}

function parsePayload(raw: unknown): CrmVoicePayload | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const record = raw as Record<string, unknown>;
  return {
    musteri_adi: String(record.musteri_adi ?? ""),
    butce: String(record.butce ?? ""),
    lokasyon: String(record.lokasyon ?? ""),
    mulk_tipi: String(record.mulk_tipi ?? ""),
    notlar: String(record.notlar ?? ""),
    telefon: record.telefon != null ? String(record.telefon) : undefined,
    eposta: record.eposta != null ? String(record.eposta) : undefined,
    niyet: record.niyet != null ? String(record.niyet) : undefined,
    aciliyet: record.aciliyet != null ? String(record.aciliyet) : undefined,
    takip_tarihi:
      record.takip_tarihi != null ? String(record.takip_tarihi) : undefined,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;
    const log = await getVoiceLogForAgent(id, agent.id);

    if (!log) {
      return NextResponse.json({ error: "Sesli not bulunamadı." }, { status: 404 });
    }

    const candidates = await findVoiceClientCandidates(
      agent.id,
      log.parsed_json_data,
    );

    return NextResponse.json({
      log,
      candidates: candidates.map((candidate) => ({
        ...candidate,
        confidenceLabel: confidenceLabel(candidate.confidence),
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıt yüklenemedi.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Oturum") ? 401 : 400 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: unknown;
      clientId?: unknown;
      payload?: unknown;
      appendTranscript?: unknown;
    };

    if (!isApplyAction(body.action)) {
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    const log = await applyVoiceLogAction({
      logId: id,
      agentId: agent.id,
      action: body.action,
      clientId: typeof body.clientId === "string" ? body.clientId : undefined,
      payload: parsePayload(body.payload),
      appendTranscript:
        typeof body.appendTranscript === "string"
          ? body.appendTranscript
          : undefined,
    });

    if (!log) {
      return NextResponse.json({ error: "Sesli not bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ log });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İşlem tamamlanamadı.";
    const status = message.includes("Oturum") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;
    const { deleteVoiceLogForAgent } = await import("@/lib/voice-crm/voice-log-store");
    const deleted = await deleteVoiceLogForAgent(id, agent.id);

    if (!deleted) {
      return NextResponse.json({ error: "Sesli not bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Silme işlemi başarısız.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Oturum") ? 401 : 400 },
    );
  }
}
