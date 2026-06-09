import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { DISTANCE_SALES_SECTIONS } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
};

export default function DistanceSalesPage() {
  return (
    <LegalDocument
      title="Mesafeli Satış Sözleşmesi"
      description="Dijital abonelik hizmetine ilişkin mesafeli satış ve ödeme koşulları."
      sections={DISTANCE_SALES_SECTIONS}
    />
  );
}
