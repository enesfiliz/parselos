import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { KisaDonemGetiriHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kisa-donem-kiralama-getiri-hesaplama");

export const metadata = aracMetadata(
  "kisa-donem-kiralama-getiri-hesaplama",
  "Kısa dönem (günlük) kiralama getirisi hesaplama: gecelik fiyat, doluluk oranı ve giderlerle aylık net geliri görün. Ücretsiz, üyeliksiz.",
);

export default function KisaDonemGetiriPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KisaDonemGetiriHesaplayici />}
      iliskili={["kira-getirisi-hesaplama", "isyeri-net-brut-kira-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Uzun dönem mi, kısa dönem mi?
          </h2>
          <p>
            Kısa dönem kiralama kâğıt üzerinde daha yüksek gecelik fiyat
            sunar; ancak doluluk dalgalanır, temizlik ve platform komisyonu
            gider yaratır, sezon dışı boşluklar geliri düşürür. Bu araç
            ortalama doluluk ve sabit gider varsayımıyla aylık neti gösterir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Yasal izin ve vergi boyutu
          </h2>
          <p>
            Türkiye&apos;de kısa dönem kiralama için belediye izin belgesi ve
            kimlik bildirim yükümlülüğü vardır; gelir vergisi/KDV rejimi uzun
            dönem kiralamadan farklıdır. Hesap yalnızca gelir tarafını
            modelleyen bir kaba taslaktır; bölgenizin kurallarını teyit edin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Doluluk oranını gerçekçi tutun
          </h2>
          <p>
            Turistik sezon ortalaması ile yıllık ortalama farklıdır. Yüksek
            sezona aldanıp %90 doluluk varsaymak yerine yıl geneli
            ortalamasını yazın; araç aynı sonucu 12 aya yayarak yıllık net
            gelirinizi gösterir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Kısa dönem kiralama kârlı mı?",
          cevap:
            "Doluluk, sezon ve giderlere bağlıdır. Bu araç ortalama bir senaryo ile aylık net gelir gösterir; kesin kârlılık için işletme giderleri ve vergi dahil edilmelidir.",
        },
        {
          soru: "Doluluk oranı nedir?",
          cevap:
            "Ay içindeki gecelik satış sayısının toplam geceye oranıdır. Rezervasyon geçmişinizi veya bölge ortalamasını esas alabilirsiniz.",
        },
      ]}
    />
  );
}
