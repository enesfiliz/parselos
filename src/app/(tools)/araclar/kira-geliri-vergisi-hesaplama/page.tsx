import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { KiraGeliriVergisiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kira-geliri-vergisi-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Kira geliri vergisi hesaplama: yıllık brüt kiradan istisnayı ve gideri (götürü %15 veya gerçek gider) düşüp tahmini gelir vergisini görün. Ücretsiz, üyeliksiz.",
  alternates: { canonical: "https://parselos.com/araclar/kira-geliri-vergisi-hesaplama" },
};

export default function KiraGeliriVergisiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KiraGeliriVergisiHesaplayici />}
      iliskili={["kira-artisi-hesaplama", "emlak-vergisi-hesaplama", "kira-getirisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Kira geliri vergisi nasıl hesaplanır?
          </h2>
          <p>
            Mesken kira geliri, yıllık brüt tutar üzerinden beyan edilir. Önce
            istisna tutarı düşülür, ardından gider yöntemi seçilir: götürü
            giderde kalan tutarın %15&apos;i otomatik gider sayılır; gerçek
            giderde ise belgelenebilir harcamalar (amortisman, bakım, aidat,
            kredi faizi vb.) esas alınır. Kalan matrah, artan oranlı gelir
            vergisi tarifesine göre vergilendirilir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Götürü mü, gerçek gider mi?
          </h2>
          <p>
            Götürü gider yöntemi basittir ve belge gerektirmez; ancak iki yıl
            boyunca bu yöntemden dönülemez. Gerçek gider yöntemi, gider toplamı
            matrahın %15&apos;ini aşıyorsa daha avantajlıdır. Araçta iki
            yöntemi de deneyip farkı görebilirsiniz.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Sonuç neden &quot;yaklaşık&quot;tır?
          </h2>
          <p>
            Gelir vergisi tarifesinde her gelir diliminin oranı farklıdır
            (%15&apos;ten başlar, %40&apos;a kadar çıkar). Bu araç, matrahınız
            için girdiğiniz ortalama oranla yaklaşık bir vergi üretir. Kesin
            tutar; yıllık istisna rakamına, tarife dilimlerine ve diğer
            gelirlerinize göre değişir. Resmî beyan için güncel GİB rakamlarını
            esas alın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Her kira geliri için vergi ödenir mi?",
          cevap:
            "Mesken kira gelirinde yıllık istisna tutarının altında kalan gelirler için beyanname verilmez ve vergi çıkmaz. İş yeri kiralarından elde edilen gelir genellikle doğrudan stopaja tabidir.",
        },
        {
          soru: "Kira vergisi ne zaman ödenir?",
          cevap:
            "Beyanname genellikle takip eden yılın Mart ayında verilir; vergi birinci ve ikinci taksit olmak üzere iki eşit taksitte ödenir.",
        },
        {
          soru: "Stopaj ödenen kira için tekrar vergi çıkar mı?",
          cevap:
            "İş yeri kirasında ödenen stopaj, beyanname varsa hesaplanan vergiden mahsup edilir. Mesken kirasında stopaj yoktur; vergi tamamen beyanla doğar.",
        },
      ]}
    />
  );
}
