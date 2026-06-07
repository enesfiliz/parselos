import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "ParselOS — Gayrimenkulde Yapay Zeka Devrimi",
  description:
    "SPK standartlarında ekspertiz, yapay zeka destekli müşteri yönetimi ve TKGM entegrasyonu.",
};

export default function HomePage() {
  return <LandingPage />;
}
