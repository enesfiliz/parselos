export function parsePriceToInteger(text: string): number | null {
  if (!text.trim()) return null;

  const patterns = [
    /(\d{1,3}(?:\.\d{3})+)\s*(?:TL|₺)/i,
    /(?:TL|₺)\s*(\d{1,3}(?:\.\d{3})+)/i,
    /(\d{1,3}(?:\.\d{3})+)\s*TL/i,
    /(\d{4,})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const amount = Number(match[1].replace(/[^\d]/g, ""));
      if (!Number.isNaN(amount) && amount >= 10_000) {
        return amount;
      }
    }
  }

  const digitsOnly = text.replace(/[^\d]/g, "");
  const fallback = Number(digitsOnly);
  if (!Number.isNaN(fallback) && fallback >= 10_000) {
    return fallback;
  }

  return null;
}
