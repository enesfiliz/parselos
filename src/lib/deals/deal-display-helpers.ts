import type { DealCardData } from "@/lib/types/deal";

export function resolvePropertyType(deal: DealCardData) {
  const kat = deal.property.tur;
  if (deal.property.odaSayisi) {
    if (kat === "FSBO") return `${deal.property.odaSayisi} Daire (FSBO)`;
    return `${deal.property.odaSayisi} Daire`;
  }
  if (
    deal.property.ilanBasligi?.toLocaleLowerCase("tr-TR").includes("arsa") ||
    kat === "ARS"
  ) {
    return "Arsa";
  }
  if (kat === "FSBO") return "FSBO Mülk";
  return "Gayrimenkul";
}
