import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { VerasetIntikalHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("veraset-intikal-vergisi-hesaplama");

export const metadata = aracMetadata(
  "veraset-intikal-vergisi-hesaplama",
  "Veraset ve intikal vergisi hesaplama: nakit miras payınızdan yıllık istisnayı düşüp artan oranlı tarifeye göre tahmini vergiyi görün. Ücretsiz, üyeliksiz.",
);

export default function VerasetIntikalPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<VerasetIntikalHesaplayici />}
      iliskili={["deger-artisi-kazanc-vergisi-hesaplama", "tapu-harci-hesaplama", "emlak-vergisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Mirasa vergi var mı?
          </h2>
          <p>
            Veraset ve intikal vergisi; ölüm yoluyla geçen miras ve bağış
            (intikal) yoluyla elde edilen gelirler için ödenir. Her yasal
            mirasçı kendi payı için mükelleftir ve payına yıllık istisna
            uygulanır. İstisnanın altındaki nakit miras payları için vergi
            doğmaz.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Tarife nasıl işler?
          </h2>
          <p>
            Matrah arttıkça oran kademeli yükselir: başlangıç dilimi %10&apos;dan
            açılır, en üst dilimde %30&apos;a kadar çıkar. Bu araç, matrahınız
            için girdiğiniz ortalama oranla yaklaşık bir vergi üretir; kesin
            tutar dilim geçişlerine bağlı olduğundan beyannamede GİB
            tarifesiyle netleşir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Beyan süresi ne?
          </h2>
          <p>
            Miras yoluyla intikallerde beyanname, ölüm tarihine ve veraset
            ilamının alınmasına göre değişen sürelerde (Türkiye içinde genellikle
            4 ay içinde) verilir; vergi taksitler halinde ödenebilir. Süreleri
            kaçırmamak için vergi dairesi veya mali müşavir doğrulaması önerilir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Ev ve arsa için de bu vergi ödenir mi?",
          cevap:
            "Taşınmazlar veraset ve intikal vergisine dahildir ancak beyanları emlak vergisi değerine göre yapılır ve taşınmazlara özel istisnalar uygulanabilir. Araç, nakit ve benzeri miras payları içindir.",
        },
        {
          soru: "İstisna her mirasçı için ayrı mı?",
          cevap:
            "Evet. Yıllık istisna, mirası paylaşan her bir yasal mirasçının kendi payına ayrı ayrı uygulanır.",
        },
        {
          soru: "Bankadaki para nasıl beyan edilir?",
          cevap:
            "Ölüm tarihinde banka, hesap bakiyesini vergi dairesine bildirir; mirasçılar bu tutarları beyannamede taşınır mal olarak gösterir.",
        },
      ]}
    />
  );
}
