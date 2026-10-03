import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { NetBrutHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("net-brut-m2-hesaplama");

export const metadata = aracMetadata(
  "net-brut-m2-hesaplama",
  "Brüt metrekareden ortak alan ve duvar kaybını düşerek tahmini net alanı hesaplayın. Daire fiyatını net m² üzerinden doğru karşılaştırın.",
);

export default function NetBrutM2HesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<NetBrutHesaplayici />}
      iliskili={["imar-hesaplama", "kira-getirisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Brüt ve net alan farkı
          </h2>
          <p>
            Brüt alan; duvarlar, balkonlar ve paylaşılan ortak alanların
            (koridor, merdiven, sığınak) kesitiyle oluşan toplam alandır. Net
            alan, daire içinde fiilen kullanılan alandır. Konut tipi ve projeye
            göre brütten nete{" "}
            <strong className="text-foreground">%15-25 kayıp</strong> yaygındır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Neden net m² üzerinden karşılaştırın?
          </h2>
          <p>
            İlanlarda metrekare birim fiyatı genelde brüt üzerinden yazılır; iki
            farklı projenin &quot;m² fiyatı&quot; yanıltıcı olabilir. Satış
            bedelini <em>net</em> alana böldüğünüzde karşılaştırılabilir birim
            fiyat elde edersiniz — alıcıya sunduğunuz teklifte bu rakamı
            kullanın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Tapuda hangi alan yazar?
          </h2>
          <p>
            Tapu kaydındaki brüt alan ile mimari projedeki net kullanım alanı
            farklıdır; kesin net metrekare için proje ve yerinde ölçüm esas
            alınmalıdır. Kira sözleşmelerinde ve satış vaadi sözleşmelerinde
            hangi alanın esas alındığını mutlaka yazın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Net m² nasıl hesaplanır?",
          cevap:
            "Brüt alandan duvar kalınlıkları ve ortak alan payları düşülerek bulunur; pratik tahmin için brüt × (1 - kayıp oranı) formülü kullanılır.",
        },
        {
          soru: "Balkon nete sayılır mı?",
          cevap:
            "Bağımsız bölüm brüt alanının hesaplanmasında balkon ve teraslar projeye göre kısmen dahil edilir; net kullanım alanı tanımları projeden projeye değişir. Sözleşmenizde hangi standardı esas aldığınızı açıkça belirtin.",
        },
      ]}
    />
  );
}
