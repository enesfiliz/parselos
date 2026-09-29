import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { KdvHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kdv-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "KDV hesaplama: tutara KDV ekleme veya KDV dahil fiyattan KDV çıkarma işlemlerini saniyeler içinde yapın. %20, %10 ve %1 oranlarıyla ücretsiz, üyeliksiz hesap.",
  alternates: { canonical: "https://parselos.com/araclar/kdv-hesaplama" },
};

export default function KdvHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KdvHesaplayici />}
      iliskili={["yuzde-hesaplama", "komisyon-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            KDV nasıl hesaplanır?
          </h2>
          <p>
            KDV hariç tutara KDV eklemek için:{" "}
            <strong className="text-foreground">tutar × (1 + oran)</strong>.
            KDV dahil fiyattan KDV çıkarmak için:{" "}
            <strong className="text-foreground">
              dahil tutar ÷ (1 + oran)
            </strong>
            . Örneğin %20 KDV dahil ₺12.000&apos;nin matrahı ₺10.000, KDV
            tutarı ₺2.000&apos;dir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Türkiye&apos;de güncel KDV oranları
          </h2>
          <p>
            Standart KDV oranı %20&apos;dir. Bazı temel gıda ve malzemelerde
            %10, teslimi KDV tevkifatına tabi işlemlerde farklı uygulamalar
            olabilir; fatura düzenlemeden önce mal veya hizmetin hangi oran
            kapsamında olduğunu teyit edin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Neden KDV dahil mi, hariç mi sorusu önemli?
          </h2>
          <p>
            Pazarlıklarda ve tekliflerde tarafların &quot;fiyat&quot; derken
            matrahı mı yoksa KDV dahil toplamı mı kastettiği sıkça
            karıştırılır. Teklifinizi hangi taban üzerinden verdiğinizi yazılı
            olarak belirtin; bu araç iki yönü de aynı ekranında gösterir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "KDV oranı kaçtır?",
          cevap:
            "Mal ve hizmetin türüne göre %1, %10 veya %20 uygulanır; standart oran %20'dir. Güncel listeler Hazine ve Maliye Bakanlığı kararlarıyla belirlenir.",
        },
        {
          soru: "KDV dahil tutardan matrah nasıl bulunur?",
          cevap:
            "Dahil tutar, (1 + oran) katsayısına bölünür. %20 için dahil tutar ÷ 1,20 matrahı verir; fark KDV tutarıdır.",
        },
        {
          soru: "Bu araç fatura yerine geçer mi?",
          cevap:
            "Hayır; yalnızca hızlı hesaplama içindir. Kesin vergi yükümlülükleriniz için mali müşavirinize danışın.",
        },
      ]}
    />
  );
}
