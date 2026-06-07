-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "fsboLeadId" TEXT;

-- CreateIndex
CREATE INDEX "Deal_fsboLeadId_idx" ON "Deal"("fsboLeadId");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_fsboLeadId_fkey" FOREIGN KEY ("fsboLeadId") REFERENCES "FsboLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
