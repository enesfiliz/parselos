import type { MetadataRoute } from "next";

const APP_ONLY_PATHS = [
  "account",
  "admin",
  "arsiv",
  "billing",
  "calculators",
  "calendar",
  "customers",
  "dashboard",
  "deals",
  "ekip",
  "ekspertiz",
  "finans",
  "ilan-asistani",
  "imar-radari",
  "invite",
  "login",
  "matching",
  "musteriler",
  "ofis-operasyonu",
  "portfolios",
  "properties",
  "sesli-crm",
  "sign-in",
  "sign-up",
  "tapu-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...APP_ONLY_PATHS.map((p) => `/${p}/`)],
    },
    sitemap: "https://parselos.com/sitemap.xml",
    host: "https://parselos.com",
  };
}
