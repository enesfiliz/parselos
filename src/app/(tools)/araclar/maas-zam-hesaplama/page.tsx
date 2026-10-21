import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { MaasZamHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("maas-zam-hesaplama");

export const metadata = aracMetadata(
  "maas-zam-hesaplama",
  "Maaş zam hesaplama: zam oranına göre yeni maaşı, aylık ve yıllık farkı ve enflasyon karşısında erimeyen gerçek artış oranını görün. Ücretsiz, üyeliksiz.",
);

export default function MaasZamPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<MaasZamHesaplayici />}
      iliskili={["yuzde-hesaplama", "enflasyon-hesaplama", "kira-artisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Zam oranı nasıl hesaplanır?
          </h2>
          <p>
            Yeni maaş = mevcut maaş × (1 + zam oranı). Örneğin 45.000 TL alan
            bir çalışanda %30 zam, maaşı 58.500 TL&apos;ye çıkarır; aylık fark
            13.500 TL, yıllık fark 162.000 TL&apos;dir. Görüşmede oran yerine
            rakam konuşmak, masaya otururken bu araçla net hedef belirlemenizi
            sağlar.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Enflasyonist ortamda &quot;gerçek zam&quot; nedir?
          </h2>
          <p>
            Alım gücünüzü koruyan şey zammın kendisi değil enflasyonu aşan
            kısmıdır. Reel artış = (1 + zam) / (1 + enflasyon) − 1 formülüyle
            bulunur: %30 zam ve %35 enflasyonda gerçek artış negatiftir; yani
            maaşınız artarken alım gücünüz düşer. Araç, enflasyon oranını
            girdiğinizde bu farkı otomatik hesaplar.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Zam görüşmesinde nelere dikkat edilmeli?
          </h2>
          <p>
            Brüt mü net mi anlaşma yaptığıınızı netleştirin; asgari geçim
            istisnası, prim, yol-yemek gibi yan haklar toplam paketi değiştirir.
            Toplu iş sözleşmesi veya şirket politikası gereği taban oran
            açıklanıyorsa, enflasyon üstü talep gerekçelendirmek için TÜİK
            TÜFE&apos;sini referans göstermek en yaygın yöntemdir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Zam brüt maaşa mı net maaşa mı uygulanır?",
          cevap:
            "Yasal ve kurumsal uygulamada zam oranı brüt ücrete uygulanır; net maaş, gelir vergisi dilimine göre brütten daha az veya daha fazla artabilir.",
        },
        {
          soru: "Enflasyon zammından düşük kalırsam ne olur?",
          cevap:
            "Reel artış negatif olur; kağıt üzerinde maaşınız artar ama aynı sepeti almak için daha fazla pay ayırırsınız. Araçtaki 'gerçek artış' satırı bunu gösterir.",
        },
        {
          soru: "Yüzde 50 zam ile 2 katına çıkmak aynı mı?",
          cevap:
            "Evet. %50 zam mevcut maaşın 1,5 katı, %100 zam ise tam 2 katı anlamına gelir; karıştırmamak için araç yeni maaşı doğrudan gösterir.",
        },
      ]}
    />
  );
}
