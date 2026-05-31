import { DashboardView } from "@/components/features/dashboard/DashboardView";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [toplamMusteri, toplamRapor, sonMusteriler] = await Promise.all([
    prisma.client.count(),
    prisma.appraisalReport.count(),
    prisma.client.findMany({
      take: 5,
      orderBy: { olusturulmaTarihi: "desc" },
      select: {
        id: true,
        adSoyad: true,
        telefon: true,
        email: true,
        olusturulmaTarihi: true,
      },
    }),
  ]);

  return (
    <DashboardView
      toplamMusteri={toplamMusteri}
      toplamRapor={toplamRapor}
      sonMusteriler={sonMusteriler.map((client) => ({
        id: client.id,
        adSoyad: client.adSoyad,
        telefon: client.telefon,
        email: client.email,
        olusturulmaTarihi: client.olusturulmaTarihi.toISOString(),
      }))}
    />
  );
}
