export type AracKategorisi = "gayrimenkul" | "gunluk";

export type AracTanimi = {
  slug: string;
  baslik: string;
  kisaAd: string;
  kisaAciklama: string;
  kategori: AracKategorisi;
};

export const ARACLAR: AracTanimi[] = [
  {
    slug: "komisyon-hesaplama",
    baslik: "Emlak Komisyon Hesaplama",
    kisaAd: "Komisyon",
    kisaAciklama:
      "Satış bedeline göre alıcı ve satıcı hizmet bedelini KDV dahil hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "kira-getirisi-hesaplama",
    baslik: "Kira Getirisi Hesaplama",
    kisaAd: "Kira Getirisi",
    kisaAciklama:
      "Taşınmazın yıllık brüt getiri oranını ve kendini kaç yılda amorti ettiğini öğrenin.",
    kategori: "gayrimenkul",
  },
  {
    slug: "kira-artisi-hesaplama",
    baslik: "Kira Artış Oranı Hesaplama",
    kisaAd: "Kira Artışı",
    kisaAciklama:
      "Yenileme döneminde yeni kirayı ve iş yeri kiralarında stopaj sonrası neti hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "tapu-harci-hesaplama",
    baslik: "Tapu Harcı Hesaplama",
    kisaAd: "Tapu Harcı",
    kisaAciklama:
      "Alıcı ve satıcının tapu harcı paylarını ve döner sermaye dahil genel toplamı bulun.",
    kategori: "gayrimenkul",
  },
  {
    slug: "komisyon-paylasimi-hesaplama",
    baslik: "Komisyon Paylaşımı Hesaplama",
    kisaAd: "Komisyon Paylaşımı",
    kisaAciklama:
      "İki taraflı aracılık ve ofis-danışman dağılımında danışmanın eline geçeni hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "imar-hesaplama",
    baslik: "İmar / Emsal Hesaplama",
    kisaAd: "İmar – Emsal",
    kisaAciklama:
      "Arsa alanı, TAKS ve KAKS değerlerinden taban alanı ve toplam inşaat alanını bulun.",
    kategori: "gayrimenkul",
  },
  {
    slug: "net-brut-m2-hesaplama",
    baslik: "Net / Brüt m² Hesaplama",
    kisaAd: "Net / Brüt m²",
    kisaAciklama:
      "Brüt metrekareden ortak alan ve duvar kaybını düşerek tahmini net alanı hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "konut-kredisi-hesaplama",
    baslik: "Konut Kredisi Taksit Hesaplama",
    kisaAd: "Konut Kredisi",
    kisaAciklama:
      "Kredi tutarı, vade ve faiz oranıyla aylık taksiti ve toplam geri ödemeyi görün.",
    kategori: "gayrimenkul",
  },
  {
    slug: "isyeri-net-brut-kira-hesaplama",
    baslik: "İş Yeri Net / Brüt Kira Hesaplama",
    kisaAd: "Net / Brüt Kira",
    kisaAciklama:
      "Mal sahibinin istediği net kiraya karşılık sözleşmeye yazılması gereken brüt kirayı bulun.",
    kategori: "gayrimenkul",
  },
  {
    slug: "m2-birim-fiyat-hesaplama",
    baslik: "m² Birim Fiyat Hesaplama",
    kisaAd: "m² Birim Fiyat",
    kisaAciklama:
      "Toplam bedeli alana bölüp metrekare birim fiyatını bulun; ilanları aynı ölçekle karşılaştırın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "kira-komisyonu-hesaplama",
    baslik: "Kiralama Komisyonu Hesaplama",
    kisaAd: "Kira Komisyonu",
    kisaAciklama:
      "Kiralama işleminde yasal tavana göre hizmet bedelini ve KDV dahil toplamı hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "dask-hesaplama",
    baslik: "DASK (Zorunlu Deprem Sigortası) Hesaplama",
    kisaAd: "DASK",
    kisaAciklama:
      "Konut alanı ve güncel baz bedelle sigorta bedelini ve yaklaşık yıllık primi hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "kisa-donem-kiralama-getiri-hesaplama",
    baslik: "Kısa Dönem Kiralama Getiri Hesaplama",
    kisaAd: "Kısa Dönem Getiri",
    kisaAciklama:
      "Gecelik fiyat, doluluk oranı ve giderlerle kısa dönem kiralamanın aylık-net gelirini görün.",
    kategori: "gayrimenkul",
  },
  {
    slug: "emlak-vergisi-hesaplama",
    baslik: "Emlak Vergisi Hesaplama",
    kisaAd: "Emlak Vergisi",
    kisaAciklama:
      "Rayiç bedel ve güncel oranla yıllık emlak vergisini ve iki taksit tutarını hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "deger-artisi-kazanc-vergisi-hesaplama",
    baslik: "Değer Artışı Kazancı Vergisi Hesaplama",
    kisaAd: "Değer Artışı Vergisi",
    kisaAciklama:
      "5 yıl içinde satılan konut/büroda kazancı, istisna sonrası tutarı ve yaklaşık vergiyi görün.",
    kategori: "gayrimenkul",
  },
  {
    slug: "kdv-hesaplama",
    baslik: "KDV Hesaplama",
    kisaAd: "KDV",
    kisaAciklama:
      "Fiyata KDV ekleme ve KDV dahil tutardan KDV çıkarma işlemlerini saniyeler içinde yapın.",
    kategori: "gunluk",
  },
  {
    slug: "yuzde-hesaplama",
    baslik: "Yüzde Hesaplama",
    kisaAd: "Yüzde",
    kisaAciklama:
      "Bir sayının yüzdesini, zam/indirim sonrası halini ve iki sayının oranını hesaplayın.",
    kategori: "gunluk",
  },
  {
    slug: "ihtiyac-kredisi-hesaplama",
    baslik: "İhtiyaç Kredisi Taksit Hesaplama",
    kisaAd: "İhtiyaç Kredisi",
    kisaAciklama:
      "Kredi tutarı, vade ve aylık faiz oranıyla taksiti ve toplam geri ödemeyi görün.",
    kategori: "gunluk",
  },
  {
    slug: "bilesik-faiz-hesaplama",
    baslik: "Bileşik Faiz / Getiri Hesaplama",
    kisaAd: "Bileşik Faiz",
    kisaAciklama:
      "Birikimin faiz faiz nasıl büyüdüğünü vade sonunda toplam değerle görün.",
    kategori: "gunluk",
  },
  {
    slug: "basit-faiz-hesaplama",
    baslik: "Basit Faiz Hesaplama",
    kisaAd: "Basit Faiz",
    kisaAciklama:
      "Faizi ana paraya eklemeden vade sonu getiriyi ve toplam tutarı hesaplayın.",
    kategori: "gunluk",
  },
  {
    slug: "gun-sayisi-hesaplama",
    baslik: "Gün Sayısı / Tarih Aralığı Hesaplama",
    kisaAd: "Gün Sayısı",
    kisaAciklama:
      "İki tarih arasındaki toplam gün, iş günü ve yıl-ay-gün dökümünü görün.",
    kategori: "gunluk",
  },
  {
    slug: "kira-geliri-vergisi-hesaplama",
    baslik: "Kira Geliri Vergisi Hesaplama",
    kisaAd: "Kira Geliri Vergisi",
    kisaAciklama:
      "Mesken kira gelirimde istisna ve gider sonrası ne kadar gelir vergisi çıkar yaklaşık hesaplayın.",
    kategori: "gayrimenkul",
  },
  {
    slug: "kidem-tazminati-hesaplama",
    baslik: "Kıdem Tazminatı Hesaplama",
    kisaAd: "Kıdem Tazminatı",
    kisaAciklama:
      "Brüt ücret ve kıdem süresine göre tavan dahil brüt ve net kıdem tazminatını hesaplayın.",
    kategori: "gunluk",
  },
  {
    slug: "ev-alma-maliyeti-hesaplama",
    baslik: "Ev Alma Maliyeti Hesaplama",
    kisaAd: "Ev Alma Maliyeti",
    kisaAciklama:
      "Satış bedeline tapu harcı, komisyon, DASK ve diğer giderleri ekleyip toplam maliyeti görün.",
    kategori: "gayrimenkul",
  },
];

export function aracBilgisi(slug: string): AracTanimi {
  const a = ARACLAR.find((x) => x.slug === slug);
  if (!a) throw new Error(`Bilinmeyen araç: ${slug}`);
  return a;
}
