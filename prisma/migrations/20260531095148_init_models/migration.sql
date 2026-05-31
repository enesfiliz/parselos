-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adSoyad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "notlar" TEXT,
    "olusturulmaTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppraisalReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baslik" TEXT NOT NULL,
    "ada" TEXT NOT NULL,
    "parsel" TEXT NOT NULL,
    "m2" TEXT NOT NULL,
    "jsonVerisi" TEXT NOT NULL,
    "clientId" TEXT,
    "olusturulmaTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppraisalReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingText" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "olusturulmaTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
