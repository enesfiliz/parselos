import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { KomisyonPaylasimHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("komisyon-paylasimi-hesaplama");

export const metadata = aracMetadata(
  "komisyon-paylasimi-hesaplama",
  "Satış veya kiralama komisyonunda ofis-danışman paylarını ve iki aracılı (portföyü düzenleyen ofis) işlemlerde dağılımı hesaplayın.",
);

export default function KomisyonPaylasimiHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KomisyonPaylasimHesaplayici />}
      iliskili={["komisyon-hesaplama", "tapu-harci-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            İki taraflı aracılık işlemlerinde paylaşım
          </h2>
          <p>
            Taşınmaz Ticareti Yönetmeliği, hizmet bedelinin yetki belgesi sahibi
            işletmeler arasında nasıl paylaşılacağını serbest bırakır.
            Sektörde yaygın teamül, toplam komisyonun önce{" "}
            <strong className="text-foreground">
              düzenleyen/ortak ofise
            </strong>{" "}
            ayrılması, kalan tutarın ofis içi dağıtıma girmesidir. Bu araç iki
            kademe bu paylaşımı modeller.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Ofis-danışman oranları
          </h2>
          <p>
            Türkiye&apos;de danışman payı, satış komisyonunun
            %40-70&apos;i aralığında konuşulur; bölgeye, ofise ve kademeli
            (basamaklı) anlaşmalara göre yaygın bir pratiktir — kanuni sabit
            oran değildir. Maaşlı danışmanlıkta farklı modeller geçerlidir.
            Araç, ortak ofis payı düştükten sonra kalan havuzun ofis oranını
            uygular; kalan tutarın tamamı danışmana yazılır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Görüşme öncesi net rakam
          </h2>
          <p>
            Danışmanın prim görüşmesinde &quot;bu satıştan cebine tam olarak
            şu kadar girecek&quot; diyebilmesi, güven ve motivasyon için en
            güçlü cümledir. Hesap ekranını paylaşarak müzakereyi şeffaf
            yürütün.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Komisyon paylaşımında KDV kimin payından düşer?",
          cevap:
            "KDV, hizmet bedeline eklenen vergidir; paylaşım genelde KDV hariç matrah üzerinden yapılır. Tahsil edilen KDV, faturayı kesen işletmenin beyannamesine girer — iç anlaşmada bunun nasıl ele alınacağı ayrıca yazılmalıdır.",
        },
        {
          soru: "Düzenleyen ofis payı neye göre belirlenir?",
          cevap:
            "Portföyü ilk alan ve ilan sorumluluğunu taşıyan işletme lehine sözleşmeyle belirlenir; yasal bir oran yoktur. Yaygın uygulama %30-50 aralığıdır.",
        },
        {
          soru: "Danışman kendi müşterisine alırsa pay değişir mi?",
          cevap:
            "Bu tamamen ofis-danışman sözleşmesi konusudur; araç istediğiniz oran kombinasyonunu hesaplamanıza olanak tanır.",
        },
      ]}
    />
  );
}
