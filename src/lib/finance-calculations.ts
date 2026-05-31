export interface CreditScheduleRow {
  ay: number;
  anapara: number;
  faiz: number;
  kalanAnapara: number;
}

export interface CreditSimulationResult {
  aylikTaksit: number;
  toplamGeriOdeme: number;
  toplamFaizYuku: number;
  schedule: CreditScheduleRow[];
}

export interface RoiAmortizationResult {
  amortismanAy: number;
  amortismanYil: number;
  kiraCarpani: number;
  yillikBrutGetiri: number;
  onYillikDegerTahmini: number;
}

const trCurrencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const trPercentFormatter = new Intl.NumberFormat("tr-TR", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "—";
  return trCurrencyFormatter.format(value);
}

export function formatNumber(value: number, fractionDigits = 0) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "—";
  return trPercentFormatter.format(value / 100);
}

export function parseTurkishNumber(value: string) {
  const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Eşit taksitli kredi amortismanı (annuity).
 * faizOraniAylik: yüzde olarak (örn. 3.5 = %3.5 aylık)
 */
export function calculateCreditSimulation(
  krediTutari: number,
  faizOraniAylik: number,
  vadeAy: number,
): CreditSimulationResult | null {
  if (krediTutari <= 0 || vadeAy <= 0 || faizOraniAylik < 0) {
    return null;
  }

  const r = faizOraniAylik / 100;

  let aylikTaksit: number;

  if (r === 0) {
    aylikTaksit = krediTutari / vadeAy;
  } else {
    const factor = Math.pow(1 + r, vadeAy);
    aylikTaksit = (krediTutari * r * factor) / (factor - 1);
  }

  const schedule: CreditScheduleRow[] = [];
  let kalan = krediTutari;
  let toplamFaiz = 0;

  for (let ay = 1; ay <= vadeAy; ay += 1) {
    const faiz = r === 0 ? 0 : kalan * r;
    const anapara = Math.min(aylikTaksit - faiz, kalan);
    kalan = Math.max(0, kalan - anapara);
    toplamFaiz += faiz;

    schedule.push({
      ay,
      anapara,
      faiz,
      kalanAnapara: kalan,
    });
  }

  const toplamGeriOdeme = aylikTaksit * vadeAy;

  return {
    aylikTaksit,
    toplamGeriOdeme,
    toplamFaizYuku: toplamFaiz,
    schedule,
  };
}

/**
 * ROI: kira ile geri dönüş ve kira çarpanı.
 */
export function calculateRoiAmortization(
  satisFiyati: number,
  aylikKira: number,
  yillikDegerArtisYuzde: number,
): RoiAmortizationResult | null {
  if (satisFiyati <= 0 || aylikKira <= 0) {
    return null;
  }

  const yillikKira = aylikKira * 12;
  const amortismanAy = satisFiyati / aylikKira;
  const kiraCarpani = satisFiyati / yillikKira;
  const yillikBrutGetiri = (yillikKira / satisFiyati) * 100;
  const onYillikDegerTahmini =
    satisFiyati * Math.pow(1 + yillikDegerArtisYuzde / 100, 10);

  return {
    amortismanAy,
    amortismanYil: amortismanAy / 12,
    kiraCarpani,
    yillikBrutGetiri,
    onYillikDegerTahmini,
  };
}
