const KOCAELI_DISTRICTS =
  /gölcük|golcuk|başiskele|basiskele|izmit|gebze|kartepe|karamürsel|karamursel|derince|dilovası|dilovasi|çayırova|cayirova/i;

export function resolveClientRegionAndType(mulkTipi: string | null) {
  if (!mulkTipi?.trim()) {
    return { region: "Belirtilmedi", propertyType: "—" };
  }

  const text = mulkTipi.trim();
  const lower = text.toLocaleLowerCase("tr-TR");

  let propertyType = "Gayrimenkul";
  if (lower.includes("imarlı arsa") || lower.includes("imarli arsa")) {
    propertyType = "İmarlı Arsa";
  } else if (lower.includes("arsa") || lower.includes("tarla") || lower.includes("parsel")) {
    propertyType = "Arsa / Tarla";
  } else if (/\d\+\d/.test(text)) {
    propertyType = `${text.match(/\d\+\d/)![0]} Daire`;
  } else if (lower.includes("daire") || lower.includes("villa") || lower.includes("konut")) {
    propertyType = "Konut";
  } else if (
    lower.includes("ticari") ||
    lower.includes("kupon") ||
    lower.includes("kat karşılığı") ||
    lower.includes("kat karsiligi")
  ) {
    propertyType = "Ticari / Kat Karşılığı";
  }

  const propertyBoundary = text.search(
    /imarlı?\s*arsa|arsa|tarla|parsel|\d\+\d|daire|villa|ticari|kupon|kat\s+karşılığı|kat\s+karsiligi/i,
  );

  let region =
    propertyBoundary > 0
      ? text
          .slice(0, propertyBoundary)
          .replace(/[/\-—]\s*$/u, "")
          .trim()
      : text;

  if (KOCAELI_DISTRICTS.test(region) && !lower.includes("kocaeli")) {
    region = `Kocaeli / ${region.replace(/\s*\/\s*/g, " · ")}`;
  }

  return { region: region || "Belirtilmedi", propertyType };
}
