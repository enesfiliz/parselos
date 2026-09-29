import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { IhtiyacKredisiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("ihtiyac-kredisi-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "İhtiyaç kredisi taksit hesaplama: kredi tutarı, vade ve aylık faiz oranıyla aylık taksiti, toplam geri ödemeyi ve faiz yükünü ücretsiz hesaplayın.",
  alternates: {
    canonical: "https://parselos.com/araclar/ihtiyac-kredisi-hesaplama",
  },
};

export default function IhtiyacKredisiHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<IhtiyacKredisiHesaplayici />}
      iliskili={["konut-kredisi-hesaplama", "bilesik-faiz-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Taksit nasıl hesaplanır?
          </h2>
          <p>
            Bankalar ihtiyaç kredilerinde aylık bileşik faiz üzerinden sabit
            taksitli (anüite) plan kullanır. Aylık taksit; kredi tutarı, vade
            ve aylık faiz oranıyla belirlenir — vade uzadıkça taksit düşer
            ancak toplam faiz yükü büyür.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Faiz oranı mı, maliyet oranı mı?
          </h2>
          <p>
            Reklamda görülen aylık faiz, kredinin tamam maliyetini
            yansıtmayabilir: tahsis ücreti, sigorta ve BSMV eklenince gerçek
            maliyet artar. Karşılaştırma yaparken bankanın açıkladığı yıllık
            toplam maliyet oranını esas alın; bu araç brüt faiz senaryosuyla
            hesaplar.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Erken kapama her zaman kârlı mı?
          </h2>
          <p>
            Kredinin ilk dönemlerinde ödenen taksidin büyük kısmı faizdir;
            erken kapama kalan anaparayı düşürdüğü için toplam maliyeti
            azaltır. Vadenin sonuna yaklaşmışken erken kapamanın avantajı
            küçülür — kapama rakamını bankadan yazılı teklif ederek teyit
            edin.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Aylık taksit ne zaman değişir?",
          cevap:
            "Sabit faizli ihtiyaç kredilerinde taksit vade boyunca değişmez; faiz oranı sözleşmede sabitlenmiştir. Değişken oranlı ürünlerde taksit güncellenebilir.",
        },
        {
          soru: "Kredi notu oranı etkiler mi?",
          cevap:
            "Evet; bankalar risk grubuna göre farklı faiz oranları uygulayabilir. Aynı vade ve tutarda faiz farkı toplam geri ödemeyi ciddi biçimde değiştirir.",
        },
      ]}
    />
  );
}
