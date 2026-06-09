import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { DELIVERY_SECTIONS } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Teslimat ve İade",
};

export default function DeliveryPage() {
  return (
    <LegalDocument
      title="Teslimat ve İade Koşulları"
      description="Dijital hizmet teslimi, iptal ve iade süreçleri."
      sections={DELIVERY_SECTIONS}
    />
  );
}
