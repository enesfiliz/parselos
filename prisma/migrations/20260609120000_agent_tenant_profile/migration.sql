-- CreateEnum
CREATE TYPE "AgentRoleType" AS ENUM ('DANISMAN', 'KURULUS', 'BROKER');

-- CreateEnum
CREATE TYPE "TenantOrganizationType" AS ENUM ('BIREYSEL', 'OFIS', 'KURULUS', 'BROKERLIK');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN "roleType" "AgentRoleType" NOT NULL DEFAULT 'DANISMAN';
ALTER TABLE "Agent" ADD COLUMN "professionalTitle" TEXT;
ALTER TABLE "Agent" ADD COLUMN "phone" TEXT;
ALTER TABLE "Agent" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "Agent" ADD COLUMN "city" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "organizationType" "TenantOrganizationType" NOT NULL DEFAULT 'BIREYSEL';
ALTER TABLE "Tenant" ADD COLUMN "taxNumber" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "address" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "phone" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "city" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "website" TEXT;
