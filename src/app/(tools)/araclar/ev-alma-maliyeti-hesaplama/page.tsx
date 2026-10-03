import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { EvAlmaMaliyetiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("ev-alma-maliyeti-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Ev alma maliyeti hesaplama: satış bedelini girin; tapu harcı, alıcı komisyonu (KDV dahil), DASK ve diğer giderlerle toplam maliyeti görün. Ücretsiz, üyeliksiz.",
  alternates: { canonical: "https://parselos.com/araclar/ev-alma-maliyeti-hesaplama" },
};

export default function EvAlmaMaliyetiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<EvAlmaMaliyetiHesaplayici />}
      iliskili={["tapu-harci-hesaplama", "komisyon-hesaplama", "dask-hesaplama", "konut-kredisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Evi olanın maliyeti satış bedeliyle bitmez
          </h2>
          <p>
            Tapuya beyan edilen satış bedelinin yanında alıcının ayrıca
            ödediği kalemler vardır: alıcı payına düşen tapu harcı, hizmet
            bedeli (komisyon) ve KDV&apos;si, zorunlu deprem sigortası primi ve
            nakliye, tadilat, ekspertiz gibi giderler. Bu araç, peşin alımda
            toplam maliyeti tek ekranında gösterir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Tapu harcı kimin payı?
          </h2>
          <p>
            Tapu harcı kural olarak beyan edilen bedel üzerinden toplam %4&apos;tür
            ve yarı yarıya alıcıyla satıcıya paylaştırılır. Bu araçta yalnızca
            alıcının payı (%2 varsayılan) hesaplanır; oranı kendi anlaşmanıza
            göre değiştirebilirsiniz.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kredili alımda ne değişir?
          </h2>
          <p>
            Konut kredisi kullanacaksanız yan maliyete kredi tahsis ücreti,
            ekspertiz raporu ve kredi sigortaları eklenir; faiz maliyeti ise
            vade boyunca ödeyeceğiniz tutara bağlıdır. Aylık taksit ve toplam
            geri ödeme için konut kredisi hesaplama aracını kullanın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Emlak komisyonu alıcıdan ne kadar alınır?",
          cevap:
            "Yasal üst sınır, satış bedelinin %2&apos;si (KDV hariç) kadar alıcı payıdır; toplam hizmet bedeli %4 + KDV&apos;yi aşamaz.",
        },
        {
          soru: "Tapu harcı gerçek bedel üzerinden mi ödenir?",
          cevap:
            "Harç, beyan edilen bedel üzerinden hesaplanır. Beyanın gerçek satış bedelinin altında olması idari ve cezai yaptırıma bağlıdır; araç gerçek bedeli girmenizi varsayar.",
        },
        {
          soru: "DASK zorunlu mu, ne kadar?",
          cevap:
            "Meskenler için zorunlu deprem sigortası yaptırma yükümlülüğü vardır; prim, metrekare, yapı tarzı ve deprem bölgesine göre değişir. Araca kendi poliçe tutarınızı yazabilirsiniz.",
        },
      ]}
    />
  );
}
