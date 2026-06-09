import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS_SECTIONS } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Kullanım Koşulları"
      description="ParselOS platformunu kullanırken geçerli şartlar ve yükümlülükler."
      sections={TERMS_SECTIONS}
    />
  );
}
