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
