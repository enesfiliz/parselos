import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { KonutKredisiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("konut-kredisi-hesaplama");

export const metadata = aracMetadata(
  "konut-kredisi-hesaplama",
  "Kredi tutarı, vade ve aylık faiz oranıyla konut kredisi aylık taksitini, toplam geri ödemeyi ve faiz yükünü hesaplayın.",
);

export default function KonutKredisiHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KonutKredisiHesaplayici />}
      iliskili={["kira-getirisi-hesaplama", "tapu-harci-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Taksit formülü
          </h2>
          <p>
            Anüite (eşit taksitli) kredide aylık ödeme = Kredi × r × (1+r)ⁿ ÷
            ((1+r)ⁿ − 1). Burada r aylık faiz oranı, n vade ay sayısıdır. Bu
            araç güncel banka oranlarını çekmez; sizin yazdığınız oranla
            hesaplar. Teklif karşılaştırmasını her bankanın kendi ödeme
            tablosundaki rakamlarla yapın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Alıcıya sunumda kritik üç sayı
          </h2>
          <p>
            Satış danışmanı için kredili alıcıyla konuşurken üç sayı belirleyici:
            aylık taksit, toplam geri ödeme ve peşinat dışındaki nakit
            masraflar (tapu harcı + ekspertiz + DASK). Araç ilk ikisini,
            tapu harcı aracı üçüncünün ana kalemini verir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kira mı taksit mi?
          </h2>
          <p>
            Aynı taşınmaz için aylık kira ile kredi taksitini karşılaştırmak,
            yatırımcının karar vermesinde kullanılan en etkili analizlerden
            biridir. Kira getirisi hesabıyla birlikte kullanın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Aylık faiz oranı mı yıllık mı yazılır?",
          cevap:
            "Araç, yazdığınız oranı aylık kabul eder. Bankaların kâr-zarar tablosundaki efektif yıllık maliyeti aylığa çevirmek kaba bir yaklaşımdır; kesin taksit için bankanın teklif tablosundaki aylık oranı kullanın.",
        },
        {
          soru: "Erken ödeme yaptım, faiz yükü değişir mi?",
          cevap:
            "Evet; kalan anapara üzerinden yeniden planlandığında toplam faiz düşer. Vade kısaltma veya taksit düşürme seçeneklerini bankanızla görüşün.",
        },
        {
          soru: "Konut kredisi masrafları ne kadar?",
          cevap:
            "Ekspertiz ücreti, DASK, ipotek tesis işlemleri ve kredi tahsis ücreti (yasal sınırla) eklenir; bunlar araçtaki toplam geri ödemeye dahil değildir.",
        },
      ]}
    />
  );
}
