import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { BasitFaizHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("basit-faiz-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Basit faiz hesaplama: ana para, yıllık oran ve vadeyi girin; faizi ana paraya eklemeden vade sonu getiriyi ve toplam tutarı görün. Ücretsiz, üyeliksiz.",
  alternates: { canonical: "https://parselos.com/araclar/basit-faiz-hesaplama" },
};

export default function BasitFaizPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<BasitFaizHesaplayici />}
      iliskili={["bilesik-faiz-hesaplama", "ihtiyac-kredisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Basit faiz nedir?
          </h2>
          <p>
            Basit faizde getiri yalnızca ana para üzerinden hesaplanır;
            biriken faiz sonraki döneme ana para olarak eklenmez. Formül
            şudur: ana para × yıllık oran × vade. Vade yıl yerine ay
            cinsinden girildiğinde araç onu otomatik olarak yıla çevirir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Bileşik faizden farkı ne?
          </h2>
          <p>
            Bileşik faizde dönem sonunda kazanılan faiz ana paraya eklenir ve
            bir sonraki dönem bu büyümüş tutar üzerinden işler; böylece para
            &quot;faiz faiz&quot; büyür. Vade uzadıkça iki sonuç arasındaki fark
            belirginleşir. Uzun vadeli birikim için bileşik faiz aracını
            kullanın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Ne zaman basit faiz kullanılır?
          </h2>
          <p>
            Tek faiz dönemli mevduat, kısa vadeli borçlanma ve tahsilat
            hesaplarında basit faiz pratik bir yaklaşımdır. Resmî ve kritik
            işlemlerde sözleşmedeki faiz yöntemini esas alın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Basit faiz formülü nedir?",
          cevap:
            "Getiri = ana para × (yıllık oran ÷ 100) × (vade ÷ 12). Araç vadeyi ay olarak alır ve yıla çevirerek hesaplar.",
        },
        {
          soru: "Mevduat faizi basit mi bileşik mi?",
          cevap:
            "Tek çekilişli kısa vadeli mevduatta getirinin büyük bölümü basit faize yakındır; vade yenilenip kazanç ana paraya eklendikçe tablo bileşik faize döner.",
        },
      ]}
    />
  );
}
