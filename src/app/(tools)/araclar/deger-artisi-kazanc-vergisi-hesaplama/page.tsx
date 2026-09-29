import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { DegerArtisiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("deger-artisi-kazanc-vergisi-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Değer artışı kazancı vergisi hesaplama: alış bedelini güncelleyip satış bedelinden çıkarın, istisna sonrası kazancı ve yaklaşık vergiyi görün. Ücretsiz, üyeliksiz.",
  alternates: {
    canonical:
      "https://parselos.com/araclar/deger-artisi-kazanc-vergisi-hesaplama",
  },
};

export default function DegerArtisiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<DegerArtisiHesaplayici />}
      iliskili={["tapu-harci-hesaplama", "kira-getirisi-hesaplama", "emlak-vergisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Hangi satışta vergi doğar?
          </h2>
          <p>
            Konut ve iş yerini alış tarihinden itibaren 5 yıl içinde
            satarsanız ve satış kârla sonuçlanıyorsa, bu &quot;değer artışı
            kazancı&quot; sayılır ve gelir vergisine tabi olur. 5 yılı
            dolduran satışlarda kazanç vergiden muaftır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Güncellenmiş alış bedeli nedir?
          </h2>
          <p>
            Alış bedeli, aradaki yılların enflasyonuyla (üretici fiyat endeksi
            oranında) güncellenerek satışa yakın bir değere çekilir. Bu
            güncelleme kazancı düşürdüğü için vergiyi de düşürür. Araçta
            güncellenmiş tutarı biliyorsanız doğrudan onu girin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Vergi kesin olarak ne çıkar?
          </h2>
          <p>
            Değer artışı kazancı, artan oranlı gelir vergisi tarifesine
            (%15’ten başlayıp %40’a kadar çıkar) göre beyanname üzerinden
            vergilendirilir. Bu araç tek bir ortalama oranla yaklaşık üretir;
            kesin tutar diğer gelirlerinize göre değişir. Yıllık istisna
            tutarı ve tarifeler her yıl güncellenir — beyan döneminde bir müşavirle
            teyit edin.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "5 yıl nasıl hesaplanır?",
          cevap:
            "Tapudaki alış tarihinden satış tarihine geçen süre esas alınır. Alışın üzerinden 5 tam yıl geçtikten sonra yapılan satışta değer artışı kazancı vergisi doğmaz.",
        },
        {
          soru: "İstisna tutarı ne kadar?",
          cevap:
            "Her yıl için ayrı bir istisna (mükellef başına) uygulanır ve yeniden değerleme oranıyla güncellenir. Araçtaki istisna alanını, o yılın resmî tutarıyla değiştirmeniz gerekir.",
        },
        {
          soru: "Birden fazla taşınmaz sattım, hepsi tek mi sayılır?",
          cevap:
            "Aynı yıl içinde, aralarında bütünlük bulunmayan birden çok taşınmaz satışı bazı durumlarda vergi kapsamı dışında kalabilir. Bu ayrım hassastır; toplam tablonuzu bir müşavirle değerlendirin.",
        },
      ]}
    />
  );
}
