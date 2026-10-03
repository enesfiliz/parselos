import type { Metadata } from "next";

import { aracBilgisi } from "@/components/tools/tools-config";

const SITE = "https://parselos.com";

export const OG_IMAGE = {
  url: `${SITE}/og-hesap-araclari.png`,
  width: 1200,
  height: 630,
  alt: "ParselOS Hesap — 30 ücretsiz hesap aracı",
};

export function aracMetadata(slug: string, aciklama: string): Metadata {
  const arac = aracBilgisi(slug);
  const url = `${SITE}/araclar/${slug}`;
  return {
    title: arac.baslik,
    description: aciklama,
    alternates: { canonical: url },
    openGraph: {
      title: arac.baslik,
      description: aciklama,
      url,
      type: "website",
      siteName: "ParselOS Hesap",
      locale: "tr_TR",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: arac.baslik,
      description: aciklama,
      images: [OG_IMAGE],
    },
  };
}
