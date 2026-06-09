import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY_SECTIONS } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
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
