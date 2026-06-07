import { PortfoliosView } from "@/components/features/portfolios/PortfoliosView";
import { getAuthorizedPortfolios } from "@/lib/portfolios/authorized-portfolios";

export const dynamic = "force-dynamic";

export default async function PortfoliosPage() {
  const portfolios = await getAuthorizedPortfolios();

  return <PortfoliosView portfolios={portfolios} />;
}
