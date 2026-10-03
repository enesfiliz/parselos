import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { M2BirimFiyatHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("m2-birim-fiyat-hesaplama");

export const metadata = aracMetadata(
  "m2-birim-fiyat-hesaplama",
  "Konut veya iş yeri için metrekare birim fiyatı hesaplama: toplam bedeli alana bölün, ilanları aynı ölçekte karşılaştırın. Ücretsiz, üyeliksiz.",
);

export default function M2BirimFiyatPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<M2BirimFiyatHesaplayici />}
      iliskili={["net-brut-m2-hesaplama", "kira-getirisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            m² birim fiyatı neden önemli?
          </h2>
          <p>
            İki ilan farklı toplam fiyatlarla gösterilebilir; asıl kıyas, aynı
            tip alanda metrekare başına ödenendir. Bedeli alana böldüğünüzde
            mahalle içi emsal karşılaştırması ve pazarlık payı netleşir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Brüt mü, net mi?
          </h2>
          <p>
            Karşılaştırmanın tutarlı olması için tüm ilanlarda aynı alan
            türünü (brüt ya da net) kullanın. Brüt alan duvar ve ortak
            alanları, net alan kullanım alanını ifade eder; hangi türün esas
            alındığını ilandan doğrulayın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Birim fiyat tek başına yeterli mi?
          </h2>
          <p>
            Hayır. Kat, cephe, cephelik durumuna göre manzara, yaşı ve deprem
            yönetmeliğine uygunluk birim fiyatı ciddi etkiler. Aracı bir
            filtre olarak kullanın, nihai değeri emsal ve ekspertizle
            belirleyin.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Birim fiyat nasıl hesaplanır?",
          cevap:
            "Toplam bedelin alan (m²) bölünmesiyle bulunur: bedel ÷ m². Araç aynı sonucu 100 m² ölçeğinde de gösterir.",
        },
        {
          soru: "Aidat birim fiyata dahil mi?",
          cevap:
            "Satışta aidat fiyata dahil değildir; kiralamada ise genelde kiracıya yansır. Kıyaslama sırasında ek giderleri ayrıca düşünün.",
        },
      ]}
    />
  );
}
