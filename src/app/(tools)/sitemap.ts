import type { MetadataRoute } from "next";

import { ARACLAR } from "@/components/tools/tools-config";

const SITE = "https://parselos.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/araclar`, changeFrequency: "weekly", priority: 0.9 },
    ...ARACLAR.map((a) => ({
      url: `${SITE}/araclar/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE}/destek`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/hakkinda`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE}/gizlilik-politikasi`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/kvkk`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/kullanim-kosullari`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
