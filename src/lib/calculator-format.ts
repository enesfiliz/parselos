export function parseTurkishMoney(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseTurkishPercent(value: string): number {
  const cleaned = value.replace(",", ".").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatTurkishInteger(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatMoneyInputFromDigits(digits: string): string {
  if (!digits) return "";
  return formatTurkishInteger(Number(digits));
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatTRY(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return `%${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)}`;
}
