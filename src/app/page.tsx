import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "ParselOS — Gayrimenkul Operasyon Platformu",
  description:
    "Portföy, müşteri, imar radarı, sesli CRM ve ParselAI asistanını broker ofis düzeninde tek merkezden yönetin.",
};

export default function HomePage() {
  return <LandingPage />;
}
