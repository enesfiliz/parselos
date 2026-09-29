import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { KiraArtisHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kira-artisi-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Yenileme döneminde uygulanabilecek kira artışını ve yeni kirayı hesaplayın. Konut ve iş yeri kiralarında yasal üst sınır, stopaj ve yıllık fark.",
  alternates: {
    canonical: "https://parselos.com/araclar/kira-artisi-hesaplama",
  },
};

export default function KiraArtisiHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KiraArtisHesaplayici />}
      iliskili={[
        "kira-getirisi-hesaplama",
        "isyeri-net-brut-kira-hesaplama",
      ]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Yasal artış üst sınırı nedir?
          </h2>
          <p>
            Konut ve iş yeri kiralarında yenileme döneminde taraflarca
            belirlenen artış oranı,{" "}
            <strong className="text-foreground">
              tüketici fiyat endeksindeki (TÜFE) 12 aylık ortalamalara göre
              değişim oranını
            </strong>{" "}
            geçemez. Temmuz 2022–Temmuz 2024 arasında uygulanan %25 geçici üst
            sınır sona
            ermiştir; güncel tavan oranı yenileme ayınızdan önce TÜİK verisiyle
            teyit edilmelidir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Sözleşmede oran yazmıyorsa
          </h2>
          <p>
            Taraflar anlaştıysa TÜFE 12 aylık ortalaması kanuni üst sınırdır.
            Uyuşmazlık hallerinde mahkeme, hakkaniyet ve emsal kiraları da
            gözetir — hesap sonucu yalnızca uzlaşı zemini olarak kullanılmalıdır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            İş yeri kiralarında stopaj
          </h2>
          <p>
            İş yeri kirasını gelire kaydeden mal sahibi gerçek kişi ise
            kiracı stopaj kesintisi yapar; kirayı net olarak isteyen mal
            sahibinin anlaşacağı rakam sözleşmeye brüt olarak yansımalıdır. Bu
            araç yenilenen brüt kiranın stopaj sonrası mal sahibine kalacak
            netini ayrıca gösterir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Kira artış oranı her yıl değişir mi?",
          cevap:
            "Evet. TÜİK 12 aylık TÜFE ortalaması her ay güncellenir; sözleşme yenileme ayınızın oranı esas alınır.",
        },
        {
          soru: "Mal sahibi TÜFE ortalamasının üstünde artış isteyebilir mi?",
          cevap:
            "Tarafların anlaştığı yenilemelerde TÜFE 12 aylık ortalaması kanuni üst sınırdır; anlaşma sağlanamazsa beş yılı dolduran konut kiralarında mal sahibi, emsal kiralar ve hakkaniyet gerekçesiyle kira tespit davası açabilir — bu yolda tavan tek başına belirleyici değildir.",
        },
        {
          soru: "Araç hangi oranı varsayar?",
          cevap:
            "Varsayılan oran bilgilendirme amaçlıdır; güncel TÜFE 12 aylık ortalamasını yazarak hesaplayın.",
        },
      ]}
    />
  );
}
