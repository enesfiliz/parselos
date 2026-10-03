import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { KrediKapatmaHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kredi-kapatma-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Kredi kapatma hesaplama: kalan ana para, taksit sayısı ve tutarını girin; erken kapama cezası dahil bugünkü kapatma tutarını ve kapanan faizi görün. Ücretsiz, üyeliksiz.",
  alternates: { canonical: "https://parselos.com/araclar/kredi-kapatma-hesaplama" },
};

export default function KrediKapatmaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KrediKapatmaHesaplayici />}
      iliskili={["ihtiyac-kredisi-hesaplama", "konut-kredisi-hesaplama", "bilesik-faiz-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Erken kredi kapatma mantığı
          </h2>
          <p>
            Krediyi vadesinden önce kapattığınızda bankaya kalan ana parayı ve
            o ana kadar işlemiş faizi ödersiniz; vade boyunca ödeyeceğiniz
            gelecek faizlerden ise kurtulursunuz. Aracı çalıştıran temel
            karşılaştırma budur: planlanan toplam ödeme ile bugünkü kapatma
            tutarı arasındaki fark, erken kapamanın size sağladığı net
            avantajdır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Erken kapama cezası ne kadar?
          </h2>
          <p>
            Tüketici kredilerinde yasal üst sınır, kalan vadeye bağlıdır: kalan
            süre 24 ay ve daha kısaysa kalan ana paranın %1&apos;ini, 24 aydan
            uzunsa %2&apos;sini aşamaz. Banka daha düşük oran uygulayabilir ya
            da hiç ceza almayabilir; kesin oranı öğrenmek için kapatma rakamı
            (bakiye) talebinde bulunun.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kapatmak her zaman kârlı mı?
          </h2>
          <p>
            Hayır. Kredinin faiz oranı, parayı değerlendirebileceğiniz
            alternatif getirinin altındaysa erken kapatmak sizi zarara
            sokabilir. Ayrıca vadenin sonuna yaklaşmış kredilerde kalan faiz
            azalmış olacağından avantaj küçülür; araçtaki &quot;eksi
            kalır&quot; satışı tam bu durumu gösterir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Kapatma tutarı nereden öğrenilir?",
          cevap:
            "Bankaların mobil şubelerinden ya da müşteri hizmetlerinden anlık kapatma (bakiye) rakamı alınabilir; araçtaki kalan ana para alanına bu tutarı yazın.",
        },
        {
          soru: "Araç faiz kaybını nasıl buluyor?",
          cevap:
            "Kalan taksit sayısı × aylık taksit, planlanan toplam ödemeyi verir. Bu tutardan kapatma bedeli düşülünce, vade sonuna kadar ödenecek faizden ne kadar kurtulduğunuz ortaya çıkar.",
        },
        {
          soru: "Kapatınca ekstra masraf olur mu?",
          cevap:
            "Erken kapama cezası dışında genellikle masraf olmaz; tahsis ücreti iadesi gibi konular banka politikasına göre değişir.",
        },
      ]}
    />
  );
}
