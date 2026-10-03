import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { YuzdeHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("yuzde-hesaplama");

export const metadata = aracMetadata(
  "yuzde-hesaplama",
  "Yüzde hesaplama: bir sayının yüzdesini, zam veya indirim sonrası değeri ve iki sayının birbirine oranını saniyeler içinde bulun. Ücretsiz, üyeliksiz.",
);

export default function YuzdeHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<YuzdeHesaplayici />}
      iliskili={["kdv-hesaplama", "kira-artisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Yüzde nasıl hesaplanır?
          </h2>
          <p>
            Bir sayının yüzdesi: <strong className="text-foreground">sayı ×
            oran ÷ 100</strong>. Örneğin 250&apos;nin %20&apos;si 50&apos;dir.
            Zam veya artış sonrası değer sayı × (1 + oran/100), indirim sonrası
            değer sayı × (1 − oran/100) formülüyle bulunur.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            İki sayı yüzde olarak birbirine eşit mi?
          </h2>
          <p>
            &quot;B, A&apos;nın yüzde kaçı?&quot; sorusu günlük hayatta en sık
            karıştırılan hesap: A&apos;yı referans alırsanız oran B ÷ A ×
            100&apos;dür; B&apos;yi referans alırsanız tam tersi çıkar. Araç,
            karşılaştırma alanına yazdığınız ikinci sayıyı birinci sayının
            yüzdesi olarak gösterir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Yüzde puanı ile yüzde farkı
          </h2>
          <p>
            Faiz veya pay ifadelerinde &quot;2 puan artış&quot; ile &quot;%2
            artış&quot; aynı şey değildir: 10&apos;dan 12&apos;ye çıkmak 2 puan,
            yani %20&apos;lik artıştır. Kira artış oranları ve komisyon
            pazarlıklarında bu ayrımı net kullanın.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Bir sayının yüzde 10'u nasıl bulunur?",
          cevap:
            "Sayıyı 10'a bölmek yeterlidir. %20 için 5'e bölün, %25 için 4'e bölün; hesap makinesine gerek kalmadan pratik yollar kullanılabilir.",
        },
        {
          soru: "Zam sonrası fiyat nasıl hesaplanır?",
          cevap:
            "Güncel fiyat × (1 + zam oranı/100). Örneğin 10.000 TL'ye %35 zam: 10.000 × 1,35 = 13.500 TL.",
        },
      ]}
    />
  );
}
