-- CreateEnum
CREATE TYPE "FsboAlertReason" AS ENUM ('PRICE_DROP', 'STALE_LISTING');

-- CreateTable
CREATE TABLE "FsboTrackedListing" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT,
    "location" TEXT,
    "source" TEXT NOT NULL DEFAULT 'sahibinden',
    "currentPrice" DECIMAL(14,2),
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "lastPriceDropAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "urgentReason" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FsboTrackedListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FsboPriceSnapshot" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "price" DECIMAL(14,2),
    "title" TEXT,
    "location" TEXT,
    "rawHtmlHash" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FsboPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FsboOpportunityAlert" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reason" "FsboAlertReason" NOT NULL,
    "previousPrice" DECIMAL(14,2),
    "currentPrice" DECIMAL(14,2),
    "priceDropRate" DECIMAL(6,4),
    "daysOnMarket" INTEGER,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FsboOpportunityAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FsboTrackedListing_url_key" ON "FsboTrackedListing"("url");

-- CreateIndex
CREATE INDEX "FsboTrackedListing_source_idx" ON "FsboTrackedListing"("source");

-- CreateIndex
CREATE INDEX "FsboTrackedListing_isActive_isUrgent_idx" ON "FsboTrackedListing"("isActive", "isUrgent");

-- CreateIndex
CREATE INDEX "FsboTrackedListing_lastCheckedAt_idx" ON "FsboTrackedListing"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "FsboPriceSnapshot_listingId_checkedAt_idx" ON "FsboPriceSnapshot"("listingId", "checkedAt");

-- CreateIndex
CREATE INDEX "FsboOpportunityAlert_reason_isResolved_idx" ON "FsboOpportunityAlert"("reason", "isResolved");

-- CreateIndex
CREATE INDEX "FsboOpportunityAlert_listingId_olusturulmaTarihi_idx" ON "FsboOpportunityAlert"("listingId", "olusturulmaTarihi");

-- AddForeignKey
ALTER TABLE "FsboPriceSnapshot" ADD CONSTRAINT "FsboPriceSnapshot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "FsboTrackedListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FsboOpportunityAlert" ADD CONSTRAINT "FsboOpportunityAlert_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "FsboTrackedListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
