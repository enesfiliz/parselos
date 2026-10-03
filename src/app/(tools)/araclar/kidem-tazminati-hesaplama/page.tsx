import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { KidemTazminatiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kidem-tazminati-hesaplama");

export const metadata = aracMetadata(
  "kidem-tazminati-hesaplama",
  "Kıdem tazminatı hesaplama: brüt ücret, kıdem süresi ve güncel tavanı girin; brüt tazminat, damga vergisi ve net ödemeyi görün. Ücretsiz, üyeliksiz.",
);

export default function KidemTazminatiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KidemTazminatiHesaplayici />}
      iliskili={["gun-sayisi-hesaplama", "kdv-hesaplama", "ihtiyac-kredisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Kıdem tazminatı nasıl hesaplanır?
          </h2>
          <p>
            Çalışılan her tam yıla karşılık 30 günlük brüt ücret ödenir. Tam
            yıla kalan süreler oranlı olarak hesaplanır. Esas alınan tutar,
            son bir yıl içindeki en yüksek brüt kazanca giydirilmiş ücrettir;
            yol, yemek ve düzenli prim gibi süreklilik taşıyan ödemeler de
            brüt ücrete dahil edilebilir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Tavan ne işe yarar?
          </h2>
          <p>
            Kıdem tazminatı, en yüksek memur emeklisi maaşı artışına bağlı bir
            tavanla sınırlandırılmıştır. Brüt ücretiniz tavanın üstündeyse
            tazminat tavan üzerinden hesaplanır. Araç, güncel tavanı girdiğiniz
            varsayımda esas alınan aylık tutarı ayrıca gösterir. Tavan her
            dönem değiştiği için hesaptan önce güncel rakamı girmeniz önerilir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Vergi kesilir mi?
          </h2>
          <p>
            Kıdem tazminatı gelir vergisinden muaftır; yalnızca damga vergisi
            kesilir (binde 7,59 civarı). Bu nedenle net ödeme, brüt
            tazminattan küçük bir damga kesintisi düşülerek bulunur.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Kıdem tazminatı kaç yıl için hesaplanır?",
          cevap:
            "4857 sayılı Kanun sonrası tam süreyle çalışılan tüm süre esas alınır; ancak 2005-2014 arası dönem için uygulanan 3600 gün şartı gibi dönemsel istisnalar bulunabilir. Net hesabı işyerinizin kayıtlarıyla doğrulayın.",
        },
        {
          soru: "İstifa eden kıdem tazminatı alabilir mi?",
          cevap:
            "Kural olarak hayır. Erkeklerde askerlik, kadınlarda evlilik sonrası bir yıl içinde ayrılma, emeklilik şartlarını doldurma veya işverenin haklı fesih halleri gibi istisnalarda istifa etse de tazminat hakkı doğar.",
        },
        {
          soru: "Yıllık izin ücreti kıdemle birlikte mi ödenir?",
          cevap:
            "Kullanılmayan yıllık izinlerin ücreti fesih tarihinde ayrıca ödenir; bu tutar kıdem tazminatından bağımsızdır ve gelir vergisine tabidir.",
        },
      ]}
    />
  );
}
