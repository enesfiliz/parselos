import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { OG_IMAGE } from "@/components/tools/arac-metadata";
import { PRIVACY_SECTIONS } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  alternates: { canonical: "https://parselos.com/gizlilik-politikasi" },
  openGraph: { url: "https://parselos.com/gizlilik-politikasi", images: [OG_IMAGE] },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Gizlilik Politikası"
      description="ParselOS’ta kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu."
      sections={PRIVACY_SECTIONS}
    />
  );
}
