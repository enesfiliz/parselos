import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { KiraGetirisiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kira-getirisi-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Gayrimenkulün yıllık brüt kira getiri oranını ve kendini kaç yılda amorti ettiğini hesaplayın. Konut ve iş yeri yatırımları için formüller ve örnekler.",
  alternates: {
    canonical: "https://parselos.com/araclar/kira-getirisi-hesaplama",
  },
};

export default function KiraGetirisiHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KiraGetirisiHesaplayici />}
      iliskili={[
        "kira-artisi-hesaplama",
        "konut-kredisi-hesaplama",
        "tapu-harci-hesaplama",
      ]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Kira getirisi formülü
          </h2>
          <p>
            Brüt yıllık kira getirisi = (Aylık kira × 12) ÷ Satış bedeli × 100.
            Türkiye&apos;de konut yatırımlarında brüt getiri çoğunlukla
            tek haneli oranlarda seyreder; yatırımın cazipliğini değerlendirken
            aynı bölgedeki emsal taşınmazların oranlarıyla ve net getiriyle
            karşılaştırın. Net getiri için vergi, aidat, boş kalma ve bakım
            maliyetlerini düşünmeyi unutmayın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Amortisman (geri dönüş) süresi
          </h2>
          <p>
            Amortisman süresi = Satış bedeli ÷ Yıllık brüt kira. Aracı, kaç yıl
            sonra taşınmazın kendini kira geliriyle finanse ettiğini gösterir.
            Kredili alımlarda gerçekçi amortisman için{" "}
            <em>konut kredisi taksit hesabı</em> ile birlikte kullanın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Müşteri sunumunda nasıl kullanılır?
          </h2>
          <p>
            Yatırımcıya portföyü satarken &quot;%4,8 brüt getiri, 21 yılda
            amorti&quot; gibi net ifadeler güven verir. Hesap sonucunu
            kopyalayıp teklif metninize ekleyin; taşınmazın ilanı için aynı
            oranı ilan açıklamasında referans olarak kullanın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Brüt getiri ile net getiri farkı nedir?",
          cevap:
            "Brüt getiri hiçbir maliyeti düşmez. Net getiri hesabında stopaj/vergi, aidat, emlak vergisi, boş kalma süresi ve bakım giderleri çıkarılır — yatırım kararında net orana bakılmalıdır.",
        },
        {
          soru: "Kira getirisi iyi olan bölge nasıl bulunur?",
          cevap:
            "Aynı segmentteki taşınmazların satış fiyatı/kira oranlarını karşılaştırın; düşük satış fiyatı ve yüksek kira, bölgenin getiri oranını yükseltir. Sonuçları sokak bazında teyit için yerel emlak danışmanına danışın.",
        },
        {
          soru: "Amortisman süresi nelere göre değişir?",
          cevap:
            "Kiranın satış bedeline oranı, kira artış hızı (TÜFE sınırı) ve değer artışı beklentisi süreyi değiştirir; araç bugünkü kira seviyesini sabit varsayar.",
        },
      ]}
    />
  );
}
