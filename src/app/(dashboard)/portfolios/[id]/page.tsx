import { notFound } from "next/navigation";

import { PortfolioDetailView } from "@/components/features/portfolios/PortfolioDetailView";
import { getAuthorizedPortfolioById } from "@/lib/portfolios/authorized-portfolios";

export const dynamic = "force-dynamic";

type PortfolioDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { id } = await params;
  const portfolio = await getAuthorizedPortfolioById(id);

  if (!portfolio) {
    notFound();
  }

  return <PortfolioDetailView initialPortfolio={portfolio} />;
}
