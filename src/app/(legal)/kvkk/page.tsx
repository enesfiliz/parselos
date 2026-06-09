import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { KVKK_SECTIONS } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
};

export default function KvkkPage() {
  return (
    <LegalDocument
      title="KVKK Aydınlatma Metni"
      description="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme."
      sections={KVKK_SECTIONS}
    />
  );
}
