import type { MetadataRoute } from "next";

import { ARACLAR } from "@/components/tools/tools-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "/", changeFrequency: "weekly", priority: 1.0 },
    { url: "/araclar", changeFrequency: "monthly", priority: 0.9 },
    ...ARACLAR.map((a) => ({
      url: `/araclar/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
