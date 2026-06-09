import type { LegalSection } from "@/components/legal/LegalDocument";
import { SITE_LEGAL } from "@/lib/legal/site-info";

const op = SITE_LEGAL.operator;

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "1. Veri Sorumlusu",
    paragraphs: [
      `${op} (“ParselOS”) olarak kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmektedir.`,
      `İletişim: ${SITE_LEGAL.email}`,
    ],
  },
  {
    title: "2. İşlenen Veriler",
    paragraphs: [
      "Hesap bilgileri (ad, e-posta, telefon), abonelik ve ödeme kayıtları (kart verisi iyzico’da tutulur), portföy ve müşteri verileri (sizin girdiğiniz içerik), teknik loglar (IP, tarayıcı, oturum).",
    ],
  },
  {
    title: "3. Amaç ve Hukuki Sebep",
    paragraphs: [
      "Hizmet sunumu, sözleşmenin ifası, meşru menfaat ve açık rıza (pazarlama iletişimi varsa) kapsamında işlenir.",
    ],
  },
  {
    title: "4. Aktarım",
    paragraphs: [
      "Barındırma (Vercel, Supabase), kimlik doğrulama (Clerk), ödeme (iyzico) ve yapay zeka API sağlayıcılarına hizmetin gerektirdiği ölçüde aktarım yapılabilir.",
    ],
  },
  {
    title: "5. Haklarınız",
    paragraphs: [
      "KVKK m.11 kapsamında erişim, düzeltme, silme, itiraz ve şikâyet haklarınızı destek@parselos.com üzerinden kullanabilirsiniz.",
    ],
  },
];

export const KVKK_SECTIONS: LegalSection[] = [
  {
    title: "Aydınlatma Metni",
    paragraphs: [
      `${op}, ParselOS platformu kullanıcılarının kişisel verilerini KVKK’ya uygun şekilde işler.`,
      "Veri kategorileri: kimlik, iletişim, müşteri işlem, finans (ödeme kaydı), işlem güvenliği.",
      "Otomatik karar alma: Fiyat önerileri ve yapay zeka çıktıları bilgilendirme amaçlıdır; tek başına hukuki sonuç doğurmaz.",
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "1. Taraflar ve Konu",
    paragraphs: [
      `Bu sözleşme ${op} ile ParselOS’a kayıt olan kullanıcı arasında dijital yazılım hizmeti kullanımına ilişkindir.`,
    ],
  },
  {
    title: "2. Hizmet Kapsamı",
    paragraphs: [
      "ParselOS; CRM, portföy, ekspertiz, ilan asistanı ve istihbarat araçları sunan bulut tabanlı bir yazılımdır. Özellikler paket tipine göre değişir.",
    ],
  },
  {
    title: "3. Kullanıcı Yükümlülükleri",
    paragraphs: [
      "Hesap güvenliğinden kullanıcı sorumludur. Üçüncü taraf sitelerden veri çekiminde ilgili platform kurallarına uyulması kullanıcının sorumluluğundadır.",
      "Yasadışı içerik, spam ve sistem kötüye kullanımı yasaktır.",
    ],
  },
  {
    title: "4. Fikri Mülkiyet",
    paragraphs: [
      "ParselOS arayüzü ve yazılımı ${op}’a aittir. Kullanıcının yüklediği veriler kullanıcıya aittir.",
    ],
  },
];

export const DISTANCE_SALES_SECTIONS: LegalSection[] = [
  {
    title: "1. Satıcı Bilgileri",
    paragraphs: [
      `Unvan: ${op}`,
      `E-posta: ${SITE_LEGAL.email}`,
      `Adres: ${SITE_LEGAL.address}`,
    ],
  },
  {
    title: "2. Ürün/Hizmet",
    paragraphs: [
      "ParselOS abonelik paketleri (Başlangıç, Danışman, Ofis) dijital yazılım hizmeti olarak sunulur. Fiyatlar sitede KDV dahil gösterilir.",
    ],
  },
  {
    title: "3. Ödeme",
    paragraphs: [
      SITE_LEGAL.iyzicoNote,
      "Abonelik yenilemeleri seçilen periyotta otomatik tahsil edilebilir; iptal panelden yapılır.",
    ],
  },
  {
    title: "4. Cayma Hakkı",
    paragraphs: [
      "6502 sayılı Kanun’un 15. maddesi (ğ) bendi uyarınca elektronik ortamda anında ifa edilen dijital içerik/hizmetlerde cayma hakkı, hizmete başlanması ile tüketici onayıyla kullanılamaz.",
      "İlk abonelik öncesi onay kutusu ile bu durum kabul edilir.",
    ],
  },
];

export const DELIVERY_SECTIONS: LegalSection[] = [
  {
    title: "Teslimat",
    paragraphs: [
      "Dijital hizmet ödemesi onaylandıktan sonra hesabınız otomatik olarak yükseltilir; ek fiziksel teslimat yoktur.",
      "Erişim sorunlarında destek@parselos.com ile 24 saat içinde dönüş hedeflenir.",
    ],
  },
  {
    title: "İade ve İptal",
    paragraphs: [
      "Aylık abonelik dönem sonunda iptal edilebilir; kullanılmayan süre için oransal iade yasal zorunluluk dışında uygulanmaz.",
      "Hatalı tahsilat veya teknik arıza durumunda inceleme sonrası iade yapılabilir.",
    ],
  },
];
