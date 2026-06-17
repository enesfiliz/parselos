-- CreateTable
CREATE TABLE IF NOT EXISTS "AgentNotification" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "tenantId" TEXT,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dedupeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AgentNotification_agentId_dismissed_read_idx" ON "AgentNotification"("agentId", "dismissed", "read");
CREATE INDEX IF NOT EXISTS "AgentNotification_agentId_createdAt_idx" ON "AgentNotification"("agentId", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "AgentNotification_agentId_dedupeKey_key" ON "AgentNotification"("agentId", "dedupeKey");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AgentNotification_agentId_fkey'
  ) THEN
    ALTER TABLE "AgentNotification" ADD CONSTRAINT "AgentNotification_agentId_fkey"
      FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
