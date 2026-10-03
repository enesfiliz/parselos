import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { ImarHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("imar-hesaplama");

export const metadata = aracMetadata(
  "imar-hesaplama",
  "Arsa metrekaresi üzerinden TAKS ve KAKS (emsal) katsayılarıyla taban oturumu ve toplam inşaat alanını hesaplayın. Arsa değerlemede emsal hesabı.",
);

export default function ImarHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<ImarHesaplayici />}
      iliskili={["net-brut-m2-hesaplama", "kira-getirisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            TAKS ve KAKS nedir?
          </h2>
          <p>
            <strong className="text-foreground">TAKS</strong> (taban alanı
            katsayısı), binanın arsada kaplayacağı taban alanının oranıdır;{" "}
            <strong className="text-foreground">KAKS</strong> (kat alanı
            katsayısı, halk arasındaki adıyla emsal) ise toplam inşaat alanının
            arsa alanına oranıdır. Arsanın kaç metrekarelik yapı ürettiğini{" "}
            <em>emsal × arsa alanı</em> belirler.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Arsa fiyatlandırmasında kullanımı
          </h2>
          <p>
            Arsa alım-satımında profesyoneller metrekare fiyatını değil{" "}
            <em>emsal/metrekare</em> fiyatını konuşur: toplam inşaat alanı
            başına ödenen tutar, karşılaştırmanın adil zeminidir. Bu hesapla
            bedeli üretilen emsal alanına bölerek hızlı bir normalizasyon
            yapın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kesin bilgi nereden alınır?
          </h2>
          <p>
            Katsayılar parsel bazında imar çapı/imar durumu belgesiyle kesinleşir;
            belediyenin e-imar servisleri ve kadastro müdürlükleri bağlayıcı
            kaynaktır. Araç, elinizdeki katsayılarla hızlı senaryo üretmek
            içindir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Emsal nasıl bulunur?",
          cevap:
            "Emsal (KAKS), toplam inşaat alanının arsa alanına bölünmesidir; imar durum belgesinde yazar. Bu araç tersini yapar: katsayıyı bildiğiniz arsanın üreteceği inşaat alanını hesaplar.",
        },
        {
          soru: "Taban oturumu neden önemli?",
          cevap:
            "Bahçe/çevre düzeni, otopark ve yapılaşma koşullarını belirler; aynı KAKS'ta düşük TAKS daha katlı, yüksek TAKS daha yatay bir proje anlamına gelir.",
        },
        {
          soru: "Arsa mı konut mu daha avantajlı?",
          cevap:
            "Arsa, emsal × m² birim fiyatı üzerinden değerlenir; hesabı bölgedeki benzer arsaların emsal satış fiyatlarıyla karşılaştırarak yapın.",
        },
      ]}
    />
  );
}
