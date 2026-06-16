/** Ürün içi yasal / operasyonel uyarı metinleri — hukuki tavsiye değildir */

export const SAHIBINDEN_POLICY = {
  title: "Sahibinden & ilan platformları",
  summary:
    "Sahibinden.com kullanım şartları otomatik tarama ve toplu veri çekimini yasaklar. ParselOS bu nedenle siteye karşı bot çalıştırmaz.",
  allowed: [
    "Fırsat Takip Merkezi üzerinden manuel kayıt ve kaynak link arşivleme",
    "Manuel lead girişi ve müşteri notları",
  ],
  notAllowed: [
    "ParselOS sunucusundan Sahibinden'e toplu / gizli scraping",
    "CAPTCHA veya erişim kontrolünü aşmaya yönelik otomasyon",
  ],
  alternative:
    "Önerilen yol: Fırsat Takip Merkezi → manuel fırsat ekleme (başlık, fiyat, konum, kaynak link).",
} as const;

export const TTBS_POLICY = {
  title: "Yetki belgesi (TTBS)",
  summary:
    "T.C. Ticaret Bakanlığı TTBS sorgu sayfası CAPTCHA korumalıdır; kamuya açık API yoktur. Otomatik devlet doğrulaması teknik olarak mümkün değildir.",
  allowed: [
    "Kullanıcının beyan ettiği yetki numarası + format kontrolü",
    "Resmi TTBS linki üzerinden kullanıcının kendi sorgusu",
    "Geliştirme ortamında TTBS_DEV_AUTO_VERIFY=1",
  ],
  recommendation:
    "Üretimde yetki rozeti «beyan + inceleme» modeliyle çalışır; resmi API veya Bakanlık iş ortaklığı olmadan tam otomasyon yapılmaz.",
  officialUrl: "https://ttbs.gtb.gov.tr/Home/BelgeSorgula",
} as const;

export const MAP_POLICY = {
  title: "İstihbarat haritası",
  summary:
    "WMS katmanları TUCBS/MTA kamu servislerinden gelir. Mapbox token gereklidir.",
  requirements: [
    "NEXT_PUBLIC_MAPBOX_TOKEN — harita görüntüleme",
    "Oturum açıkken /api/wms-proxy — katman karoları",
  ],
} as const;
