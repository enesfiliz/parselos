import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { EnflasyonHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("enflasyon-hesaplama");

export const metadata = aracMetadata(
  "enflasyon-hesaplama",
  "Enflasyon hesaplama: yıllık ortalama TÜFE ve süre girin; geçmiş tutarın bugünkü karşılığını ve bugünkü paranın alım gücü kaybını görün. Ücretsiz, üyeliksiz.",
);

export default function EnflasyonPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<EnflasyonHesaplayici />}
      iliskili={["kira-artisi-hesaplama", "bilesik-faiz-hesaplama", "basit-faiz-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Enflasyon parası olanı nasıl eritir?
          </h2>
          <p>
            Enflasyon, aynı sepetteki ürünlerin fiyatlarının yıllık ortalama
            ne kadar arttığını ölçer. Fiyatlar artarken elde tutulan nakdin
            miktarı değişmez ama satın aldığı mal azalır. Bu araç iki yönlü
            çevirim yapar: geçmişteki bir tutarın bugünkü fiyat seviyesine
            eşitlemek (kaç TL&apos;ye çıktığı) ve bugünkü nakdin ilerde ne
            kadar mal alabildiği (alım gücü kaybı).
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Hesap nasıl yapılıyor?
          </h2>
          <p>
            Bileşik enflasyon varsayımı kullanılır: her yıl, bir önceki yılın
            fiyat seviyesinin üzerine yıllık oran kadar eklenir. Yani N yıl
            sonraki değer = tutar × (1 + oran)<sup>N</sup>. Ortalama oran
            sabit kabul edildiğinden sonuç yaklaşık üretir; gerçek TÜFE
            her yıl farklıdır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Hangi oran girilmeli?
          </h2>
          <p>
            Uzun vadeli planda TÜİK&apos;in açıkladığı yıllık TÜFE
            ortalamalarını, kısa vadede son 12 aylık artışı esas alın.
            Kiracı-ev sahibi anlaşmazlıklarında yasal artış tavanı ayrı bir
            konudur; onun için kira artış oranı aracını kullanın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Enflasyonda para nasıl erir?",
          cevap:
            "Yıllık %45 enflasyonda bugün 100.000 TL ile alınan sepet, beş yıl sonra aynı sepet için yaklaşık 641.000 TL ister; eldeki 100.000 TL'nin alım gücü ise yaklaşık 15.600 TL'ye düşer.",
        },
        {
          soru: "Enflasyon mu, faiz mi bakmalı?",
          cevap:
            "Birikimin gerçek getirisi, mevduat faizinden enflasyonun çıkarılmasıyla bulunur. Faiz enflasyonun altındaysa nominal artışa rağmen alım gücü kaybedilir.",
        },
        {
          soru: "Araç kesin sonuç verir mi?",
          cevap:
            "Hayır; yıllık ortalama oran sabit varsayıldığı için sonuç yaklaşıktır. Resmî hesaplamalarda TÜİK'in yıllık gerçekleşme verileri toplanmalıdır.",
        },
      ]}
    />
  );
}
