import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { DaskHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("dask-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "DASK (zorunlu deprem sigortası) primi hesaplama: konut alanı ve güncel metrekare baz bedeliyle sigorta bedelini ve yaklaşık yıllık primi bulun.",
  alternates: { canonical: "https://parselos.com/araclar/dask-hesaplama" },
};

export default function DaskPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<DaskHesaplayici />}
      iliskili={["tapu-harci-hesaplama", "konut-kredisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            DASK nasıl hesaplanır?
          </h2>
          <p>
            Zorunlu deprem sigortasında prim, önce bir{" "}
            <strong className="text-foreground">sigorta bedeli</strong> belirlenip
            sonra bu bedele tarife oranı uygulanarak bulunur. Sigorta bedeli,
            konut alanının metrekare baz bedeliyle çarpılması ve azami teminat
            üst sınırına kadar olan kısmıdır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Rakamlar her yıl değişir
          </h2>
          <p>
            Metrekare baz bedeli, azami teminat tutarı ve tarife oranları
            DASK/SEDES tarafından her yıl güncellenir. Bu araç yaklaşık içindir;
            kesin prim için güncel tarifeyi sigortacınızdan veya acente
            ekranından teyit edin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            DASK ile konut sigortası farkı
          </h2>
          <p>
            DASK yalnızca deprem ve deprem kaynaklı zararları, zorunlu teminat
            sınırları içinde karşılar. Yangın, su baskını ve hırsızlık için
            ayrıca konut sigortası gerekir; bu araç zorunlu olan kısmı hesaplar.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "DASK primi neye göre belirlenir?",
          cevap:
            "Konutun alanı, yapı tarzı (betonarme veya diğer), risk grubu ve güncel metrekare baz bedeli ile tarife oranına göre hesaplanır.",
        },
        {
          soru: "Baz bedeli nereden bulurum?",
          cevap:
            "Metrekare baz bedeli ve azami teminat her yıl güncellenir. Güncel değerleri DASK duyurularından veya sigorta acentenizden teyit edip araçtaki alanlara yazın.",
        },
      ]}
    />
  );
}
