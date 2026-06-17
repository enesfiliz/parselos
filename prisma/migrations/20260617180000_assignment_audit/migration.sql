CREATE TABLE IF NOT EXISTS "AssignmentAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorAgentId" TEXT NOT NULL,
    "fromAgentId" TEXT,
    "toAgentId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AssignmentAudit_tenantId_createdAt_idx"
  ON "AssignmentAudit"("tenantId", "createdAt");

CREATE INDEX IF NOT EXISTS "AssignmentAudit_toAgentId_idx"
  ON "AssignmentAudit"("toAgentId");

CREATE INDEX IF NOT EXISTS "AssignmentAudit_resourceType_resourceId_idx"
  ON "AssignmentAudit"("resourceType", "resourceId");
