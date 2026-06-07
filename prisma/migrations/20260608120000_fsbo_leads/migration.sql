-- CreateTable
CREATE TABLE IF NOT EXISTS "FsboWatchRegion" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FsboWatchRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FsboLead" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" DECIMAL(14,2),
    "location" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "il" TEXT,
    "ilce" TEXT,
    "mahalle" TEXT,
    "metrekare" INTEGER,
    "odaSayisi" TEXT,
    "source" TEXT NOT NULL DEFAULT 'sahibinden',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDiscarded" BOOLEAN NOT NULL DEFAULT false,
    "promotedDealId" TEXT,
    "listedAt" TIMESTAMP(3),
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FsboLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FsboWatchRegion_label_key" ON "FsboWatchRegion"("label");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FsboLead_url_key" ON "FsboLead"("url");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FsboLead_region_idx" ON "FsboLead"("region");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FsboLead_isRead_isDiscarded_idx" ON "FsboLead"("isRead", "isDiscarded");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FsboLead_olusturulmaTarihi_idx" ON "FsboLead"("olusturulmaTarihi");

-- Seed default regions
INSERT INTO "FsboWatchRegion" ("id", "label", "olusturulmaTarihi")
VALUES
    ('region-golcuk', 'Gölcük', CURRENT_TIMESTAMP),
    ('region-basiskele', 'Başiskele', CURRENT_TIMESTAMP)
ON CONFLICT ("label") DO NOTHING;
