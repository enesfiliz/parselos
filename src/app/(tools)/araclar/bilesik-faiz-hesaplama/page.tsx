import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { BilesikFaizHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("bilesik-faiz-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Bileşik faiz hesaplama: ana para, yıllık oran ve süre ile birikimin faiz faiz nasıl büyüdüğünü; dönem sonu toplam değeri ve getiriyle görün.",
  alternates: {
    canonical: "https://parselos.com/araclar/bilesik-faiz-hesaplama",
  },
};

export default function BilesikFaizHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<BilesikFaizHesaplayici />}
      iliskili={["ihtiyac-kredisi-hesaplama", "kira-getirisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Bileşik faiz nedir?
          </h2>
          <p>
            Bileşik faizde kazandığınız faiz de anaparaya eklenir ve bir
            sonraki dönem faizi bunun üzerinden işler. Formül:{" "}
            <strong className="text-foreground">
              ana para × (1 + oran ÷ dönem sayısı)^(dönem sayısı × yıl)
            </strong>
            . Faiz ne kadar sık işletilirse (yıllık yerine aylık), dönem sonu
            toplam o kadar büyür.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Bileşik büyüme neden önemli?
          </h2>
          <p>
            Enflasyon, mevduat getirisi, birikim planı ve borç büyümesi aynı
            matematikle çalışır. Uzun vadede küçük oran farkları toplamda büyük
            farklar yaratır; araç, farklı faizlendirme sıklıklarını
            karşılaştırmanıza izin verir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Düzenli birikim dahil mi?
          </h2>
          <p>
            Bu araç tek seferlik ana para üzerinde bileşik büyümeyi gösterir;
            her ay eklenen birikim senaryoları (düzenli ödeme ile büyüme) ayrı
            bir hesaptır. Kira geliri gibi tekrar eden nakit akışları için kira
            getirisi hesabını kullanın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Bileşik faiz mi basit faiz mi daha kârlı?",
          cevap:
            "Aynı oran ve sürede bileşik faiz her zaman daha yüksek toplam verir; dönem sayısı arttıkça fark büyür.",
        },
        {
          soru: "Getiri garantisi anlamına gelir mi?",
          cevap:
            "Hayır; araç sabit oran varsayımıyla matematiksel büyüme gösterir. Gerçek enstrümanların getirisi değişken olabilir ve vergi/masraf düşülebilir.",
        },
      ]}
    />
  );
}
