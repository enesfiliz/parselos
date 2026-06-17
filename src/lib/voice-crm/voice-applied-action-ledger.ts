import "server-only";

import type { Prisma } from "@prisma/client";

import {
  createStandaloneClientInTransaction,
  type StandaloneClientInput,
} from "@/lib/clients/server-queries";
import { prisma } from "@/lib/prisma";

import { buildVoiceClientIdempotencyKey } from "./idempotency-keys";
import {
  isVoiceProcessingStale,
  VOICE_IN_PROGRESS_USER_MESSAGE,
} from "./voice-processing-policy";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function readLedgerAction(idempotencyKey: string) {
  return prisma.voiceCrmAppliedAction.findUnique({
    where: { idempotencyKey },
    select: {
      id: true,
      status: true,
      targetClientId: true,
      updatedAt: true,
    },
  });
}

async function readCompletedClientId(idempotencyKey: string): Promise<string | null> {
  const action = await readLedgerAction(idempotencyKey);

  if (action?.status === "COMPLETED" && action.targetClientId) {
    return action.targetClientId;
  }

  return null;
}

export async function hasVoiceLedgerProgress(
  agentId: string,
  voiceLogId: string,
): Promise<boolean> {
  const action = await readLedgerAction(
    buildVoiceClientIdempotencyKey(agentId, voiceLogId),
  );
  if (!action) return false;
  return action.status === "COMPLETED" || action.status === "PROCESSING";
}

export async function executeCreateClientFromVoiceLog(input: {
  agentId: string;
  voiceLogId: string;
  clientInput: StandaloneClientInput;
}): Promise<{ clientId: string }> {
  const idempotencyKey = buildVoiceClientIdempotencyKey(
    input.agentId,
    input.voiceLogId,
  );

  const existingClientId = await readCompletedClientId(idempotencyKey);
  if (existingClientId) {
    return { clientId: existingClientId };
  }

  try {
    const clientId = await prisma.$transaction(async (tx) => {
      const existing = await tx.voiceCrmAppliedAction.findUnique({
        where: { idempotencyKey },
      });

      if (existing?.status === "COMPLETED" && existing.targetClientId) {
        return existing.targetClientId;
      }

      if (
        existing?.status === "PROCESSING" &&
        !isVoiceProcessingStale(existing.updatedAt.toISOString())
      ) {
        throw new Error(VOICE_IN_PROGRESS_USER_MESSAGE);
      }

      let actionId = existing?.id;

      if (!existing) {
        const created = await tx.voiceCrmAppliedAction.create({
          data: {
            agentId: input.agentId,
            voiceLogId: input.voiceLogId,
            actionType: "create_client",
            status: "PROCESSING",
            idempotencyKey,
          },
        });
        actionId = created.id;
      } else {
        await tx.voiceCrmAppliedAction.update({
          where: { id: existing.id },
          data: { status: "PROCESSING", lastError: null },
        });
      }

      try {
        const client = await createStandaloneClientInTransaction(
          tx,
          input.agentId,
          input.clientInput,
        );

        await tx.voiceCrmAppliedAction.update({
          where: { id: actionId! },
          data: {
            status: "COMPLETED",
            targetClientId: client.id,
            completedAt: new Date(),
            lastError: null,
          },
        });

        return client.id;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "İşlem tamamlanamadı.";
        await tx.voiceCrmAppliedAction.update({
          where: { id: actionId! },
          data: {
            status: "FAILED",
            lastError: message,
          },
        });
        throw error;
      }
    });

    return { clientId };
  } catch (error) {
    if (error instanceof Error && error.message === VOICE_IN_PROGRESS_USER_MESSAGE) {
      const raced = await readCompletedClientId(idempotencyKey);
      if (raced) return { clientId: raced };
      throw error;
    }

    if (isUniqueViolation(error)) {
      const raced = await readCompletedClientId(idempotencyKey);
      if (raced) return { clientId: raced };
    }

    throw error;
  }
}

export async function getCompletedVoiceClientId(
  agentId: string,
  voiceLogId: string,
): Promise<string | null> {
  return readCompletedClientId(buildVoiceClientIdempotencyKey(agentId, voiceLogId));
}

export type VoiceLedgerTx = Prisma.TransactionClient;
