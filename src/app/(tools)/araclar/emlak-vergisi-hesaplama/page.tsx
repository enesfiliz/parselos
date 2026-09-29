import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { EmlakVergisiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("emlak-vergisi-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Emlak vergisi hesaplama: belediyedeki rayiç bedeli ve güncel vergi oranını girin, yıllık emlak vergisini ve iki taksit tutarını saniyeler içinde görün. Ücretsiz, üyeliksiz.",
  alternates: { canonical: "https://parselos.com/araclar/emlak-vergisi-hesaplama" },
};

export default function EmlakVergisiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<EmlakVergisiHesaplayici />}
      iliskili={[
        "tapu-harci-hesaplama",
        "kira-getirisi-hesaplama",
        "deger-artisi-kazanc-vergisi-hesaplama",
      ]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Emlak vergisi nasıl hesaplanır?
          </h2>
          <p>
            Emlak vergisinin temeli, belediyenin taşınmaz için belirlediği
            rayiç bedeldir. Bu bedel ile türünüze uygulanan oran
            çarpıldığında yıllık vergi çıkar; vergi yıl içinde iki eşit
            taksitte ödenir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Rayiç bedeli nereden bulurum?
          </h2>
          <p>
            Taşınmazın bağlı olduğu belediyenin emlak vergisi biriminden veya
            e-Devlet üzerinden öğrenebilirsiniz. Tapu harcında beyan edilen
            bedel ile rayiç bedel aynı şey değildir; vergi hesabında esas
            alınan rayiç bedeldir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Oran her yerde aynı mı?
          </h2>
          <p>
            Hayır. Konut, iş yeri, arsa ve arazi için farklı oranlar
            uygulanır; büyükşehirlerde oranlar daha yüksektir. Oran alanını
            kendi tarifenize göre değiştirebilirsiniz. Tek evi olan,
            emekliyseniz veya eviniz 200 m²&apos;yi geçmiyorsa indirimli
            veya sıfır vergi hakkınız olabilir — belediyenize teyit edin.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Emlak vergisi ne zaman ödenir?",
          cevap:
            "Yıllık vergi iki eşit taksitte ödenir; ilk taksit mart, ikinci taksit temmuz-kasım döneminde tahsil edilir. Güncel son ödeme tarihlerini belediyenizden doğrulayın.",
        },
        {
          soru: "Tek evi olan emekli vergi öder mi?",
          cevap:
            "Geliri sadece emekli aylığı olan ve tek meskeni bulunan (belirli büyüklük şartıyla) kişilerde emlak vergisi sıfıra kadar inebilir. Şartlar yıl ve belediyeye göre değiştiği için belediyenize başvurarak teyit edin.",
        },
        {
          soru: "Vergi değeri ile tapu harcı bedeli aynı mı?",
          cevap:
            "Hayır. Tapu harcında alım-satım beyan bedeli esas alınır; emlak vergisinde ise belediyenin rayiç bedeli. İkisini karıştırmayın — araç rayiç bedel üzerinden hesaplar.",
        },
      ]}
    />
  );
}
