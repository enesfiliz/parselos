import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { InsaatMaliyetiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("insaat-maliyeti-hesaplama");

export const metadata = aracMetadata(
  "insaat-maliyeti-hesaplama",
  "İnşaat maliyeti hesaplama: brüt inşaat alanı ve m² birim maliyeti ile sürpriz payını ekleyip toplam bütçeyi ve m² başı maliyeti görün. Ücretsiz, üyeliksiz.",
);

export default function InsaatMaliyetiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<InsaatMaliyetiHesaplayici />}
      iliskili={["imar-hesaplama", "net-brut-m2-hesaplama", "m2-birim-fiyat-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Brüt inşaat alanı nedir?
          </h2>
          <p>
            Brüt inşaat alanı; bağımsız bölümlerin duvarları, ortak alanlar
            (koridor, merdiven, asansör boşluğu, kapıcı dairesi) ve yapıya dahil
            tüm hacimlerin toplamıdır. Birim maliyet bu alan üzerinden
            hesaplandığı için, net kullanım alanına göre daha yüksek bir toplam
            çıkar. Arsanızın kaç m² inşaat ürettiğini imar/emsal aracıyla
            önce hesaplayın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            m² birim maliyeti nasıl seçilir?
          </h2>
          <p>
            Birim maliyet; yapı sınıfı (betonarme/çelik/ahşap), kalite seviyesi
            (lüks, 1. sınıf, 2. sınıf), bölge ve yılın güncel fiyatlarına göre
            çok değişir. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı&apos;nın
            her yıl yayımladığı yapı yaklaşık maliyetleri iyi bir başlangıç
            noktasıdır; ancak müteahhit teklifleri bunun üzerine kâr ve risk
            payı ekler. Bu araca kendi bölgesel rakamınızı girin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Sürpriz payı neden gerekli?
          </h2>
          <p>
            İnşaat projelerinde malzeme fiyat artışları, mevzuat değişiklikleri,
            zemin sürprizleri ve tasarım revizyonları bütçeyi şişirir. %10
            sürpriz payı yaygın bir tampon kabul edilir; riskli zemin veya uzun
            süren projelerde %15–20&apos;ye kadar çıkarılabilir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Arsa bedeli bu maliyete dahil mi?",
          cevap:
            "Hayır. Bu araç yalnızca bina yapım maliyetini hesaplar. Arsa alım bedeli, tapu harcı, proje/rapor giderleri ve ruhsat harçları ayrıca eklenmelidir.",
        },
        {
          soru: "KDV toplam maliyete dahil mi?",
          cevap:
            "Girdiğiniz birim maliyet KDV dahilse toplam da dahil olur; müteahhit tekliflerinde KDV'nin ayrı gösterilip gösterilmediğini kontrol edin. Konut teslimlerinde ayrı bir KDV yükümlülüğü doğabilir.",
        },
        {
          soru: "Maliyeti düşürmek için ne yapmalı?",
          cevap:
            "Brüt alanı akılcı küçültmek (net/brüt verimini artırmak), yapım işlerini tek pakette ihalelemek ve malzeme alımını fiyat artışından önce yapmak en etkili üç yöntemdir.",
        },
      ]}
    />
  );
}
