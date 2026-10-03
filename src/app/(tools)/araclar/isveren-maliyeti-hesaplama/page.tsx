import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { IsverenMaliyetiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("isveren-maliyeti-hesaplama");

export const metadata = aracMetadata(
  "isveren-maliyeti-hesaplama",
  "Çalışanın işverene maliyeti hesaplama: brüt maaşa SGK işveren hissesi ve İŞKUR payını ekleyip toplam aylık maliyeti ve brütün üzerindeki yükü görün. Ücretsiz, üyeliksiz.",
);

export default function IsverenMaliyetiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<IsverenMaliyetiHesaplayici />}
      iliskili={["kidem-tazminati-hesaplama", "ihbar-tazminati-hesaplama", "yuzde-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            İşverenin maliyeti brüt maaştan fazla mıdır?
          </h2>
          <p>
            Evet. Çalışana ödenen brüt ücrete ek olarak işveren, SGK primi
            işveren hissesi (standart %20,5) ve işsizlik sigortası işveren payı
            (%2) öder. Bu iki kalem tamamen işverenin üzerindedir; çalışanın
            kendi SGK ve işsizlik payları ise brüt maaştan kesilir ve net
            maaşı düşürür. Dolayısıyla bir çalışanın işverene aylık maliyeti,
            brüt ücretin yaklaşık %22,5 üstüne çıkar.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            5 puanlık SGK indirimi nedir?
          </h2>
          <p>
            Şartları sağlayan işverenler, SGK işveren hissesinin 5 puanlık
            kısmını Hazine&apos;den destek olarak alır. Bu durumda işveren
            hissesi %20,5 yerine %15,5 uygulanır ve toplam maliyet belirgin
            şekilde düşer. Araçtaki &quot;5 puan indirim var&quot; seçeneği ile
            her iki senaryoyu karşılaştırabilirsiniz.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Başka hangi maliyetler eklenir?
          </h2>
          <p>
            Bu hesap yalnızca yasal prime esas kalemleri içerir. Yol, yemek,
            ikramiye, özel sağlık sigortası ve kıdem/ihbar karşılıkları gibi
            ek yükümlülükler ayrıca planlanmalıdır; işe alım bütçesi yaparken
            toplam maliyetin üzerine bu yan hakları da eklemeyi unutmayın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Çalışanın kendi primleri işveren maliyetine dahil mi?",
          cevap:
            "Hayır. Çalışanın %14 SGK ve %1 işsizlik payı brüt maaştan kesilir; işverenin ek maliyeti yalnızca %20,5 SGK işveren hissesi ve %2 İŞKUR payıdır.",
        },
        {
          soru: "Brüt 45.000 TL maaşın işverene maliyeti ne kadar?",
          cevap:
            "Standart oranlarla yaklaşık 52.875 TL (indirimli SGK ile 50.625 TL). Kesin tutar prime esas kazanç ve geçerli teşviklere göre değişir.",
        },
        {
          soru: "SGK tavanı maliyeti etkiler mi?",
          cevap:
            "Evet. Prime esas kazancın üst sınırı aşan kısmı için prim hesaplanmaz; çok yüksek brüt maaşlarda oran değil, tavan üzerinden hesaplama yapan bir mali müşavir doğrulaması önerilir.",
        },
      ]}
    />
  );
}
