import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL tanımlı değil.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const [total, unread] = await Promise.all([
    prisma.fsboLead.count(),
    prisma.fsboLead.count({ where: { isRead: false } }),
  ]);

  console.log("FsboLead toplam:", total);
  console.log("Okunmamış (isRead: false):", unread);

  const sample = await prisma.fsboLead.findMany({
    where: { isRead: false },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, price: true, source: true, region: true },
  });

  if (sample.length > 0) {
    console.log("Örnek kayıtlar:", sample);
  }
} finally {
  await prisma.$disconnect();
  await pool.end();
}
