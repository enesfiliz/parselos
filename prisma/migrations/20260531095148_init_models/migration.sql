-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "notlar" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppraisalReport" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "ada" TEXT NOT NULL,
    "parsel" TEXT NOT NULL,
    "m2" TEXT NOT NULL,
    "jsonVerisi" TEXT NOT NULL,
    "clientId" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppraisalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingText" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingText_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AppraisalReport" ADD CONSTRAINT "AppraisalReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
