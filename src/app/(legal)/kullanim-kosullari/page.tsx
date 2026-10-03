import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { OG_IMAGE } from "@/components/tools/arac-metadata";
import { TERMS_SECTIONS } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  alternates: { canonical: "https://parselos.com/kullanim-kosullari" },
  openGraph: { url: "https://parselos.com/kullanim-kosullari", images: [OG_IMAGE] },
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
