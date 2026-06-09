-- CreateEnum
CREATE TYPE "TenantMemberRole" AS ENUM ('OWNER', 'MANAGER', 'MEMBER');
CREATE TYPE "LicenseVerificationStatus" AS ENUM ('NONE', 'PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable Tenant
ALTER TABLE "Tenant" ADD COLUMN "ownerAgentId" TEXT;

-- AlterTable Agent
ALTER TABLE "Agent" ADD COLUMN "licenseStatus" "LicenseVerificationStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Agent" ADD COLUMN "licenseSubmittedAt" TIMESTAMP(3);
ALTER TABLE "Agent" ADD COLUMN "licenseVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Agent" ADD COLUMN "licenseRejectReason" TEXT;
ALTER TABLE "Agent" ADD COLUMN "tenantMemberRole" "TenantMemberRole" NOT NULL DEFAULT 'MEMBER';

-- CreateTable TenantInvite
CREATE TABLE "TenantInvite" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdByAgentId" TEXT NOT NULL,
    "inviteRoleType" "AgentRoleType" NOT NULL DEFAULT 'DANISMAN',
    "tenantMemberRole" "TenantMemberRole" NOT NULL DEFAULT 'MEMBER',
    "maxUses" INTEGER NOT NULL DEFAULT 5,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantInvite_code_key" ON "TenantInvite"("code");
CREATE INDEX "TenantInvite_tenantId_isActive_idx" ON "TenantInvite"("tenantId", "isActive");
CREATE INDEX "TenantInvite_expiresAt_idx" ON "TenantInvite"("expiresAt");
CREATE INDEX "Tenant_ownerAgentId_idx" ON "Tenant"("ownerAgentId");
CREATE INDEX "Agent_licenseStatus_idx" ON "Agent"("licenseStatus");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_ownerAgentId_fkey" FOREIGN KEY ("ownerAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TenantInvite" ADD CONSTRAINT "TenantInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantInvite" ADD CONSTRAINT "TenantInvite_createdByAgentId_fkey" FOREIGN KEY ("createdByAgentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
