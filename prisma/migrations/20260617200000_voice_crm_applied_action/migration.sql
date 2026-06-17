-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "VoiceCrmActionStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "VoiceCrmAppliedAction" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "voiceLogId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetClientId" TEXT,
    "status" "VoiceCrmActionStatus" NOT NULL DEFAULT 'PROCESSING',
    "idempotencyKey" TEXT NOT NULL,
    "lastError" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceCrmAppliedAction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VoiceCrmAppliedAction_idempotencyKey_key"
  ON "VoiceCrmAppliedAction"("idempotencyKey");

CREATE UNIQUE INDEX IF NOT EXISTS "VoiceCrmAppliedAction_agentId_voiceLogId_actionType_key"
  ON "VoiceCrmAppliedAction"("agentId", "voiceLogId", "actionType");

CREATE INDEX IF NOT EXISTS "VoiceCrmAppliedAction_agentId_status_idx"
  ON "VoiceCrmAppliedAction"("agentId", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VoiceCrmAppliedAction_agentId_fkey'
  ) THEN
    ALTER TABLE "VoiceCrmAppliedAction" ADD CONSTRAINT "VoiceCrmAppliedAction_agentId_fkey"
      FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VoiceCrmAppliedAction_targetClientId_fkey'
  ) THEN
    ALTER TABLE "VoiceCrmAppliedAction" ADD CONSTRAINT "VoiceCrmAppliedAction_targetClientId_fkey"
      FOREIGN KEY ("targetClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
