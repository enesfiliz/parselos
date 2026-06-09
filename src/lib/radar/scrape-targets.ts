import { parseRegionParts } from "@/lib/radar/imar-radar-config";

function turkishSlug(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

const DUYURU_PATHS = [
  "/tr/icerik/duyurular",
  "/duyurular",
  "/haberler",
  "/tr/haberler",
  "/icerik/duyurular",
] as const;

/** Bölgeye göre resmi belediye / il duyuru URL'leri */
export function buildScrapeTargetsForRegion(region: string): string[] {
  const { district, city, label } = parseRegionParts(region);
  const districtSlug = turkishSlug(district);
  const citySlug = turkishSlug(city);
  const targets = new Set<string>();

  const addBelTr = (slug: string) => {
    if (!slug || slug.length < 2) return;
    for (const path of DUYURU_PATHS) {
      targets.add(`https://www.${slug}.bel.tr${path}`);
      targets.add(`https://${slug}.bel.tr${path}`);
    }
  };

  addBelTr(districtSlug);

  if (citySlug && citySlug !== districtSlug) {
    addBelTr(citySlug);
    targets.add(`https://www.${citySlug}.gov.tr/duyurular`);
    targets.add(`https://${citySlug}.gov.tr/duyurular`);
  }

  // Varsayılan örnek kaynak (Bilecik Söğüt)
  if (label.toLocaleLowerCase("tr-TR").includes("söğüt")) {
    targets.add("https://www.sogut.bel.tr/tr/icerik/duyurular");
    targets.add("https://www.bilecik.gov.tr/duyurular");
  }

  return [...targets].slice(0, 12);
}
