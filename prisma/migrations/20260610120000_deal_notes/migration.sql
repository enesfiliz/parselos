-- CreateTable
CREATE TABLE IF NOT EXISTS "DealNote" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DealNote_dealId_olusturulmaTarihi_idx" ON "DealNote"("dealId", "olusturulmaTarihi");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DealNote_dealId_fkey'
  ) THEN
    ALTER TABLE "DealNote" ADD CONSTRAINT "DealNote_dealId_fkey"
      FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
