/**
 * İmar hesaplama sonuçlarının tip tanımı
 */
export interface ImarSonucu {
  tabanOturumu: number;
  toplamInsaatAlani: number;
}

/**
 * Arsa m2, TAKS ve KAKS (Emsal) değerlerine göre imar hesaplaması yapar.
 * * @param arsaM2 - Toplam arsa alanı (m2)
 * @param taks - Taban Alanı Katsayısı (örn: 0.30)
 * @param kaks - Kat Alanı Katsayısı / Emsal (örn: 1.20)
 * @returns {ImarSonucu} Taban oturumu ve toplam inşaat alanı
 */
export const calculateImar = (arsaM2: number, taks: number, kaks: number): ImarSonucu => {
  return {
    tabanOturumu: arsaM2 * taks,
    toplamInsaatAlani: arsaM2 * kaks,
  };
};

/**
 * Komisyon detaylarının tip tanımı
 */
export interface KomisyonDetayi {
  kdvHaric: number;
  kdvTutari: number;
  kdvDahil: number;
}

/**
 * Komisyon hesaplama sonuçlarının tip tanımı
 */
export interface KomisyonSonucu {
  aliciKomisyonu: KomisyonDetayi;
  saticiKomisyonu: KomisyonDetayi;
  toplamHizmetBedeli: number;
}

/**
 * Satış bedeli üzerinden alıcı ve satıcı için %2 komisyon (KDV hariç ve dahil) hesaplar.
 * * @param satisBedeli - Gayrimenkulün satış fiyatı
 * @param kdvOrani - KDV oranı (Varsayılan %20)
 * @returns {KomisyonSonucu} Alıcı ve satıcı komisyon detayları
 */
export const calculateKomisyon = (satisBedeli: number, kdvOrani: number = 0.20): KomisyonSonucu => {
  const komisyonOrani = 0.02; // Yasal sınır olan %2

  const kdvHaricTutar = satisBedeli * komisyonOrani;
  const kdvTutari = kdvHaricTutar * kdvOrani;
  const kdvDahilTutar = kdvHaricTutar + kdvTutari;

  const detay: KomisyonDetayi = {
    kdvHaric: kdvHaricTutar,
    kdvTutari: kdvTutari,
    kdvDahil: kdvDahilTutar,
  };

  return {
    aliciKomisyonu: detay,
    saticiKomisyonu: detay,
    toplamHizmetBedeli: kdvDahilTutar * 2, // Alıcı + Satıcı toplam tahsilat
  };
};

/**
 * Tapu harcı hesaplama sonuçlarının tip tanımı
 */
export interface TapuHarciSonucu {
  aliciPayi: number;
  saticiPayi: number;
  toplam: number;
}

/**
 * Satış bedeli üzerinden %4 tapu harcını alıcı (%2) ve satıcı (%2) payına böler.
 */
export const calculateTapuHarci = (satisBedeli: number): TapuHarciSonucu => {
  const aliciPayi = satisBedeli * 0.02;
  const saticiPayi = satisBedeli * 0.02;

  return {
    aliciPayi,
    saticiPayi,
    toplam: aliciPayi + saticiPayi,
  };
};

export const DONER_SERMAYE_HARCI_TL = 1575;

export type TapuHarciDetayliSonucu = TapuHarciSonucu & {
  donerSermaye: number;
  genelToplam: number;
};

export function calculateTapuHarciDetayli(
  satisBedeli: number,
  donerSermayeAktif: boolean,
): TapuHarciDetayliSonucu {
  const base = calculateTapuHarci(satisBedeli);
  const donerSermaye = donerSermayeAktif ? DONER_SERMAYE_HARCI_TL : 0;

  return {
    ...base,
    donerSermaye,
    genelToplam: base.toplam + donerSermaye,
  };
}

export type MortgageSonucu = {
  aylikTaksit: number;
  toplamGeriOdeme: number;
  toplamFaiz: number;
};

export function calculateMortgage(
  krediTutari: number,
  vadeAy: number,
  aylikFaizOrani: number,
): MortgageSonucu | null {
  if (krediTutari <= 0 || vadeAy <= 0 || aylikFaizOrani < 0) return null;

  const r = aylikFaizOrani / 100;

  if (r === 0) {
    const aylikTaksit = krediTutari / vadeAy;
    return {
      aylikTaksit,
      toplamGeriOdeme: krediTutari,
      toplamFaiz: 0,
    };
  }

  const factor = Math.pow(1 + r, vadeAy);
  const aylikTaksit = (krediTutari * r * factor) / (factor - 1);
  const toplamGeriOdeme = aylikTaksit * vadeAy;

  return {
    aylikTaksit,
    toplamGeriOdeme,
    toplamFaiz: toplamGeriOdeme - krediTutari,
  };
}

export type HizmetBedeliTipi = "sale" | "rent";

export type HizmetBedeliSonucu = {
  tip: HizmetBedeliTipi;
  aliciKomisyonu?: KomisyonDetayi;
  saticiKomisyonu?: KomisyonDetayi;
  kiralikKomisyonu?: KomisyonDetayi;
  toplamHizmetBedeli: number;
};

function buildKomisyonDetayi(
  matrah: number,
  kdvOrani: number,
): KomisyonDetayi {
  const kdvHaric = matrah;
  const kdvTutari = kdvHaric * kdvOrani;
  return {
    kdvHaric,
    kdvTutari,
    kdvDahil: kdvHaric + kdvTutari,
  };
}

export function calculateHizmetBedeli(
  bedel: number,
  tip: HizmetBedeliTipi,
  kdvOrani = 0.2,
): HizmetBedeliSonucu | null {
  if (bedel <= 0) return null;

  if (tip === "rent") {
    const kiralikKomisyonu = buildKomisyonDetayi(bedel, kdvOrani);
    return {
      tip,
      kiralikKomisyonu,
      toplamHizmetBedeli: kiralikKomisyonu.kdvDahil,
    };
  }

  const matrah = bedel * 0.02;
  const aliciKomisyonu = buildKomisyonDetayi(matrah, kdvOrani);
  const saticiKomisyonu = buildKomisyonDetayi(matrah, kdvOrani);

  return {
    tip,
    aliciKomisyonu,
    saticiKomisyonu,
    toplamHizmetBedeli:
      aliciKomisyonu.kdvDahil + saticiKomisyonu.kdvDahil,
  };
}

export type AmortismanSonucu = {
  yillikBrutGetiri: number;
  geriDonusYil: number;
  geriDonusAy: number;
};

export function calculateAmortisman(
  mulkDegeri: number,
  aylikKira: number,
): AmortismanSonucu | null {
  if (mulkDegeri <= 0 || aylikKira <= 0) return null;

  const yillikKira = aylikKira * 12;
  const yillikBrutGetiri = (yillikKira / mulkDegeri) * 100;
  const toplamAy = mulkDegeri / aylikKira;
  const geriDonusYil = Math.floor(toplamAy / 12);
  const geriDonusAy = Math.round(toplamAy % 12);

  return {
    yillikBrutGetiri,
    geriDonusYil,
    geriDonusAy,
  };
}

export function calculateTaksTaban(arsaM2: number, taks: number): number | null {
  if (arsaM2 <= 0 || taks <= 0) return null;
  return arsaM2 * taks;
}

export function calculateKaksInsaat(arsaM2: number, kaks: number): number | null {
  if (arsaM2 <= 0 || kaks <= 0) return null;
  return arsaM2 * kaks;
}

export function calculateNetM2(
  brutM2: number,
  kayipYuzdesi: number,
): number | null {
  if (brutM2 <= 0 || kayipYuzdesi < 0 || kayipYuzdesi >= 100) return null;
  return brutM2 * (1 - kayipYuzdesi / 100);
}

export function calculateKiraArtisi(
  mevcutKira: number,
  artisOrani: number,
): number | null {
  if (mevcutKira <= 0 || artisOrani < 0) return null;
  return mevcutKira * (1 + artisOrani / 100);
}
