import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { TapuHarciHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("tapu-harci-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Satış bedeli üzerinden alıcı ve satıcının tapu harcı paylarını (%2 + %2) ve döner sermaye bedeli dahil genel toplamı hesaplayın.",
  alternates: {
    canonical: "https://parselos.com/araclar/tapu-harci-hesaplama",
  },
};

export default function TapuHarciHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<TapuHarciHesaplayici />}
      iliskili={[
        "komisyon-hesaplama",
        "konut-kredisi-hesaplama",
        "kira-getirisi-hesaplama",
      ]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Tapu harcı nasıl hesaplanır?
          </h2>
          <p>
            Alım-satım işlemlerinde harç, tapuda{" "}
            <strong className="text-foreground">
              beyan edilen satış bedeli üzerinden %4
            </strong>{" "}
            oranında alınır. Uygulamada bu tutar alıcı ve
              satıcıdan %2 + %2 olarak tahsil edilir; tarafların aksine
              anlaşması mümkündür.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Düşük bedel beyanının riski
          </h2>
          <p>
            Gerçek bedelden düşük beyan, hem eksik ödenen harç için vergi
            ziyaı cezası hem de alıcı-satıcı arasındaki uyuşmazlıkta ciddi
            hukuki kayıp doğurur. Tapu müdürlükleri banko işlemleri ve bölge
            emsal karşılaştırmaları üzerinden düşük beyanı tespit edebilir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Harca eklenen maliyetler
          </h2>
          <p>
            Döner sermaye bedeli (işlem türüne göre sabit ücret), harcın
            yanındaki standart maliyettir; araçtaki alana güncel tutarı
            yazarak genel toplamı görebilirsiniz. İpotekli işlemlerde ek
            masraflar doğabilir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Tapu harcı kimin sorumluluğundadır?",
          cevap:
            "Kanuni yükümlülük beyan edilen bedel üzerinden %4'tür; teamül gereği alıcı ve satıcı eşit (2+2) paylaşır. Sözleşmeyle farklı paylaşım kararlaştırılabilir.",
        },
        {
          soru: "Döner sermaye bedeli nedir?",
          cevap:
            "Tapu müdürlüğünün tahsil ettiği sabit işlem ücretidir; her yıl güncellenir ve harca eklenir.",
        },
        {
          soru: "Miras veya bağış devrinde oran aynı mı?",
          cevap:
            "Hayır. İntikal ve bağış işlemleri farklı oran ve esaslara tabidir; bu araç yalnızca alım-satım (satış) işlemi içindir.",
        },
      ]}
    />
  );
}
