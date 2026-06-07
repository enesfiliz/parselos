-- Client: kaynak alanı (init migration'da eksikti)
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "kaynak" TEXT;

-- Enum'lar (varsa atla)
DO $$ BEGIN
    CREATE TYPE "DealStage" AS ENUM ('LEAD', 'SHOWING', 'OFFER', 'WON', 'LOST');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PropertyListingStatus" AS ENUM ('SATILIK', 'KIRALIK');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PropertyOwnershipType" AS ENUM ('FSBO', 'YETKILI');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Property tablosu
CREATE TABLE IF NOT EXISTS "Property" (
    "id" TEXT NOT NULL,
    "ilanBasligi" TEXT NOT NULL,
    "fiyat" DECIMAL(14,2),
    "il" TEXT NOT NULL,
    "ilce" TEXT NOT NULL,
    "mahalle" TEXT,
    "ada" TEXT,
    "parsel" TEXT,
    "metrekare" INTEGER,
    "odaSayisi" TEXT,
    "durum" "PropertyListingStatus" NOT NULL,
    "tur" "PropertyOwnershipType" NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- Deal tablosu (temel şema; CRM alanları aşağıda eklenir)
CREATE TABLE IF NOT EXISTS "Deal" (
    "id" TEXT NOT NULL,
    "stage" "DealStage" NOT NULL DEFAULT 'LEAD',
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "notlar" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CRM alanları
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "etiket" TEXT;
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "sonIletisim" TEXT;
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "budgetTL" INTEGER;
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "tasks" JSONB;
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "listingUrl" TEXT;
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "listingIntel" JSONB;

-- Index'ler
CREATE INDEX IF NOT EXISTS "Deal_stage_idx" ON "Deal"("stage");
CREATE INDEX IF NOT EXISTS "Deal_clientId_idx" ON "Deal"("clientId");
CREATE INDEX IF NOT EXISTS "Deal_propertyId_idx" ON "Deal"("propertyId");

-- Foreign key'ler (varsa atla)
DO $$ BEGIN
    ALTER TABLE "Deal" ADD CONSTRAINT "Deal_clientId_fkey"
        FOREIGN KEY ("clientId") REFERENCES "Client"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Deal" ADD CONSTRAINT "Deal_propertyId_fkey"
        FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
