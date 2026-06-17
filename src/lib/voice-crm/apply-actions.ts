import "server-only";

import {
  assertClientLinkableByAgent,
} from "@/lib/clients/server-queries";
import { prisma } from "@/lib/prisma";
import type { CrmVoicePayload } from "@/lib/types/crm";

import {
  claimVoiceLogForClientCreation,
  getVoiceLogForAgent,
  releaseVoiceLogProcessingClaim,
  updateVoiceLogForAgent,
} from "./voice-log-store";
import {
  executeCreateClientFromVoiceLog,
  getCompletedVoiceClientId,
  hasVoiceLedgerProgress,
} from "./voice-applied-action-ledger";
import { reconcileVoiceLogFromLedger, syncVoiceLogAfterClientCreate } from "./reconcile-voice-log";
import {
  mergeVoicePayload,
  mergeVoiceTranscript,
} from "./merge-voice-payload";
import {
  VOICE_IN_PROGRESS_USER_MESSAGE,
  VOICE_RETRY_USER_MESSAGE,
} from "./voice-processing-policy";

export type VoiceApplyAction =
  | "create_client"
  | "match_client"
  | "update_client"
  | "note_only"
  | "later"
  | "dismiss"
  | "archive"
  | "unarchive"
  | "append_info";

export type VoiceApplyInput = {
  logId: string;
  agentId: string;
  action: VoiceApplyAction;
  clientId?: string;
  payload?: CrmVoicePayload;
  appendTranscript?: string;
};

const ALREADY_TRANSFERRED = "Bu kayıt zaten müşteriye aktarıldı.";

function mergeNotes(existing: string | null, incoming: string): string {
  const base = existing?.trim() ?? "";
  const next = incoming.trim();
  if (!base) return next;
  if (!next) return base;
  if (base.includes(next)) return base;
  return `${base}\n\n[Sesli not] ${next}`;
}

function isClientLinked(log: {
  client_id?: string | null;
  status?: string;
  applied_action?: string | null;
}) {
  if (log.client_id) return true;
  return (
    log.status === "processed" &&
    (log.applied_action === "create_client" ||
      log.applied_action === "match_client" ||
      log.applied_action === "update_client")
  );
}

function toUserFacingVoiceError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.message === VOICE_IN_PROGRESS_USER_MESSAGE) {
      return error;
    }
    if (
      error.message.includes("İşlem devam ediyor") ||
      error.message.includes("unique") ||
      error.message.includes("P2002")
    ) {
      return new Error(VOICE_IN_PROGRESS_USER_MESSAGE);
    }
  }
  return new Error(VOICE_RETRY_USER_MESSAGE);
}

async function resolveExistingLinkedLog(logId: string, agentId: string) {
  const refreshed = await getVoiceLogForAgent(logId, agentId);
  if (!refreshed) {
    throw new Error("Sesli not bulunamadı.");
  }
  if (isClientLinked(refreshed)) {
    return refreshed;
  }
  return null;
}

async function resolveLedgerLinkedLog(logId: string, agentId: string) {
  const clientId = await getCompletedVoiceClientId(agentId, logId);
  if (!clientId) return null;
  return reconcileVoiceLogFromLedger(agentId, logId, clientId);
}

async function runCreateClientFlow(
  input: VoiceApplyInput,
  payload: CrmVoicePayload,
  adSoyad: string,
) {
  const { clientId } = await executeCreateClientFromVoiceLog({
    agentId: input.agentId,
    voiceLogId: input.logId,
    clientInput: {
      adSoyad,
      telefon: payload.telefon?.trim() || null,
      email: payload.eposta?.trim() || null,
      butce: payload.butce || null,
      mulkTipi: payload.mulk_tipi || payload.lokasyon || null,
      notlar: mergeNotes(null, payload.notlar),
      kaynak: "Sesli CRM",
    },
  });

  const updated = await syncVoiceLogAfterClientCreate(
    input.logId,
    input.agentId,
    clientId,
  );

  if (updated) {
    return updated;
  }

  const reconciled = await reconcileVoiceLogFromLedger(
    input.agentId,
    input.logId,
    clientId,
  );
  if (reconciled) return reconciled;

  const refreshed = await getVoiceLogForAgent(input.logId, input.agentId);
  if (refreshed) return refreshed;

  throw new Error(VOICE_RETRY_USER_MESSAGE);
}

export async function applyVoiceLogAction(input: VoiceApplyInput) {
  const log = await getVoiceLogForAgent(input.logId, input.agentId);
  if (!log) {
    throw new Error("Sesli not bulunamadı.");
  }

  const payload = input.payload ?? log.parsed_json_data;
  const adSoyad = payload.musteri_adi?.trim();

  switch (input.action) {
    case "later":
      return updateVoiceLogForAgent(input.logId, input.agentId, {
        status: "pending",
        appliedAction: "later",
      });

    case "dismiss":
      return updateVoiceLogForAgent(input.logId, input.agentId, {
        status: "dismissed",
        appliedAction: "dismiss",
      });

    case "archive":
      return updateVoiceLogForAgent(input.logId, input.agentId, {
        status: "archived",
        appliedAction: "archive",
      });

    case "unarchive":
      return updateVoiceLogForAgent(input.logId, input.agentId, {
        status: "pending",
        appliedAction: null,
      });

    case "append_info": {
      const incoming = input.payload ?? log.parsed_json_data;
      const mergedPayload = mergeVoicePayload(log.parsed_json_data, incoming);
      const mergedTranscript = input.appendTranscript
        ? mergeVoiceTranscript(log.transcript, input.appendTranscript)
        : log.transcript ?? undefined;

      const updated = await updateVoiceLogForAgent(input.logId, input.agentId, {
        parsed_json_data: mergedPayload as unknown as Record<string, unknown>,
        transcript: mergedTranscript,
        status:
          log.status === "archived" || log.status === "dismissed"
            ? "pending"
            : log.status ?? "pending",
      });

      if (updated?.client_id && incoming.notlar?.trim()) {
        const existing = await prisma.client.findUnique({
          where: { id: updated.client_id },
        });
        if (existing) {
          await prisma.client.update({
            where: { id: updated.client_id },
            data: {
              notlar: mergeNotes(existing.notlar, incoming.notlar),
              butce: mergedPayload.butce?.trim() || existing.butce,
              mulkTipi: mergedPayload.mulk_tipi?.trim() || existing.mulkTipi,
            },
          });
        }
      }

      return updated;
    }

    case "note_only":
      return updateVoiceLogForAgent(input.logId, input.agentId, {
        status: "processed",
        appliedAction: "note_only",
      });

    case "create_client": {
      if (isClientLinked(log)) {
        return log;
      }

      const ledgerLinked = await resolveLedgerLinkedLog(input.logId, input.agentId);
      if (ledgerLinked) {
        return ledgerLinked;
      }

      if (!adSoyad) {
        throw new Error("Müşteri adı olmadan yeni kayıt oluşturulamaz.");
      }

      const claim = await claimVoiceLogForClientCreation(input.logId, input.agentId);

      if (claim.kind === "in_progress") {
        const ledgerRetry = await resolveLedgerLinkedLog(input.logId, input.agentId);
        if (ledgerRetry) return ledgerRetry;
        throw new Error(VOICE_IN_PROGRESS_USER_MESSAGE);
      }

      if (claim.kind === "denied") {
        const ledgerRetry = await resolveLedgerLinkedLog(input.logId, input.agentId);
        if (ledgerRetry) return ledgerRetry;

        const existing = await resolveExistingLinkedLog(input.logId, input.agentId);
        if (existing) return existing;

        throw new Error(ALREADY_TRANSFERRED);
      }

      try {
        return await runCreateClientFlow(input, payload, adSoyad);
      } catch (error) {
        const raced = await resolveLedgerLinkedLog(input.logId, input.agentId);
        if (raced) return raced;

        const hasProgress = await hasVoiceLedgerProgress(input.agentId, input.logId);
        if (!hasProgress) {
          await releaseVoiceLogProcessingClaim(input.logId, input.agentId);
        }

        throw toUserFacingVoiceError(error);
      }
    }

    case "match_client":
    case "update_client": {
      if (log.client_id && input.clientId && log.client_id !== input.clientId) {
        throw new Error(ALREADY_TRANSFERRED);
      }

      if (!input.clientId) {
        throw new Error("Müşteri seçimi gerekli.");
      }

      const linkable = await assertClientLinkableByAgent(
        input.clientId,
        input.agentId,
      );
      if (linkable === "not_found") {
        throw new Error("Müşteri bulunamadı.");
      }
      if (linkable === "forbidden") {
        throw new Error("Bu müşteri kaydına erişim yok.");
      }

      const existing = await prisma.client.findUnique({
        where: { id: input.clientId },
      });
      if (!existing) {
        throw new Error("Müşteri bulunamadı.");
      }

      await prisma.client.update({
        where: { id: input.clientId },
        data: {
          butce: payload.butce?.trim() || existing.butce,
          mulkTipi: payload.mulk_tipi?.trim() || existing.mulkTipi,
          notlar: mergeNotes(existing.notlar, payload.notlar),
        },
      });

      return updateVoiceLogForAgent(input.logId, input.agentId, {
        status: "processed",
        clientId: input.clientId,
        appliedAction: input.action,
      });
    }

    default:
      throw new Error("Geçersiz işlem.");
  }

  throw new Error("Geçersiz işlem.");
}

export async function assertVoiceLogOwned(
  logId: string,
  agentId: string,
): Promise<boolean> {
  const log = await getVoiceLogForAgent(logId, agentId);
  return log !== null;
}
