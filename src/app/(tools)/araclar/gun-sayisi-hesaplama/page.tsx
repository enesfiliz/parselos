import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { GunSayisiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("gun-sayisi-hesaplama");

export const metadata = aracMetadata(
  "gun-sayisi-hesaplama",
  "Gün sayısı hesaplama: iki tarih arasındaki toplam gün, hafta sonlarını düşmüş iş günü sayısı ve yıl/ay/gün dökümü. Kira sözleşmesi, ihbar ve vadeler için ücretsiz araç.",
);

export default function GunSayisiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<GunSayisiHesaplayici />}
      iliskili={["kira-artisi-hesaplama", "konut-kredisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Gün sayısı nasıl sayılır?
          </h2>
          <p>
            Araç, başlangıç gününü hariç tutup bitiş gününü dahil ederek iki
            tarih arasındaki tam gün sayısını verir. Bu, kira sözleşmesi ve
            ihbar sürelerinde sık kullanılan sayım biçimidir; sözleşmenizde
            farklı bir kural yazıyorsa onu esas alın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            İş günü sayısı ne işe yarar?
          </h2>
          <p>
            İş günü sayımı hafta sonlarını (cumartesi-pazar) düşürür; böylece
            bir tebligat, fatura vadesi ya da çalışma süresi için geçen gerçek
            mesai günlerini görebilirsiniz. Resmî ve dinî tatiller bu
            sayıma dahil değildir — kritik vadelerde takvimden ayrıca kontrol
            edin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kira kontratı için hangi gün saymalıyım?
          </h2>
          <p>
            Kira sözleşmelerinde süre genelde takvim günü ile hesaplanır;
            yenileme ve artış dönemini bulmak için başlangıç tarihine 12 ay
            ekleyin. Uyarlama davası ve ihtar sürelerinde gün hesabı
            önem kazanır; emin olmadığınız süreleri bir hukuk müşavirine
            teyit ettirin.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Başlangıç günü sayılıyor mu?",
          cevap:
            "Hayır. Araç başlangıç gününü hariç tutar, bitiş gününü dahil eder. Yani 1 Ocak ile 2 Ocak arası 1 gün olarak görünür.",
        },
        {
          soru: "Hafta sonu ve tatiller iş gününden düşer mi?",
          cevap:
            "Cumartesi ve pazar iş günü sayısından otomatik düşülür. Resmî ve dinî tatiller düşülmez; bunları kendiniz hesaba katmalısınız.",
        },
      ]}
    />
  );
}
