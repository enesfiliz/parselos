import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { AracDegerKaybiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("arac-deger-kaybi-hesaplama");

export const metadata = aracMetadata(
  "arac-deger-kaybi-hesaplama",
  "Araç değer kaybı hesaplama: kazalı aracın onarım sonrası piyasa değerinde oluşan düşüşü ve karşı taraftan talep edilecek yaklaşık değer kaybını görün. Ücretsiz, üyeliksiz.",
);

export default function AracDegerKaybiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<AracDegerKaybiHesaplayici />}
      iliskili={["kdv-hesaplama", "yuzde-hesaplama", "ihtiyac-kredisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Değer kaybı nedir, neden doğar?
          </h2>
          <p>
            Trafik kazasında hasar gören ve onarılan bir araç, hasar kaydı
            nedeniyle ikinci elde hasarsız emsalinden daha düşük fiyata satılır.
            İşte bu fark &quot;değer kaybı&quot;dır ve onarım masrafından bağımsız
            ayrı bir tazminat kalemidir; kusursuz (haklı) taraf, kusurlu
            tarafın trafik sigortasından talep edebilir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Nasıl hesaplanır?
          </h2>
          <p>
            Temel mantık: kaza tarihindeki hasarsız piyasa değerinden, aynı
            model/muadeli için hasar kayıtlı araca biçilen değerin
            düşülmesidir. Sigorta şirketleri eksper raporlarında onarım
            bedelinin piyasa değerine oranını ve araç yaşını esas alan
            katsayılar kullanır; onarım oranı yükseldikçe değer kaybı oranı da
            yükselir. Bu araç, iki değer arasındaki farkı ve onarım oranınızı
            gösterir — eksper raporu yerine geçmez, talep öncesi ön bilgilendirme
            içindir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Talep nasıl yapılır?
          </h2>
          <p>
            Kusurlu tarafın trafik sigortacısına kaza tespit tutanağı, hasar
            fotoğrafları ve onarım faturalarıyla başvurulur; reddedilen veya
            eksik ödenen talepler için Sigorta Tahkim Komisyonu hızlı ve masrafsız
            bir yoldur. Zamanaşımı iki yıl olduğundan başvuruyu geciktirmemek
            gerekir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Araç pert ise yine değer kaybı alınır mı?",
          cevap:
            "Hayır. Pert (tam hasar) halinde araç değerinin tamamı ödenir; ayrıca değer kaybı talep edilemez. Değer kaybı, onarılarak kullanıma devam edilen araçlar içindir.",
        },
        {
          soru: "Kendi sigortamdan da alabilir miyim?",
          cevap:
            "Değer kaybı karşı tarafın trafik sigortasından talep edilir. Kendi kasko poliçenizde 'değer kaybı teminatı' varsa kendi sigortacınızdan da talep mümkündür.",
        },
        {
          soru: "Değeri düşük araçta dava açmaya değer mi?",
          cevap:
            "Sigorta Tahkim Komisyonu başvurusu mahkemeye göre çok daha hızlı ve düşüktür; binlerce liralık kayıplar için bile başvuru yapılabilir. Eşik altı taleplerde önce sigorta şirketine yazılı başvuru şarttır.",
        },
      ]}
    />
  );
}
