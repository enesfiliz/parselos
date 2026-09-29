import type { Metadata } from "next";

import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { NetIcinBrutKiraHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("isyeri-net-brut-kira-hesaplama");

export const metadata: Metadata = {
  title: arac.baslik,
  description:
    "Mal sahibinin istediği net iş yeri kirasına karşılık sözleşmeye yazılması gereken brüt kirayı ve stopaj yükünü hesaplayın.",
  alternates: {
    canonical:
      "https://parselos.com/araclar/isyeri-net-brut-kira-hesaplama",
  },
};

export default function IsyeriNetBrutKiraHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<NetIcinBrutKiraHesaplayici />}
      iliskili={["kira-artisi-hesaplama", "kira-getirisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Stopaj nasıl işler?
          </h2>
          <p>
            İş yerini gerçek kişi mal sahibine kiralayan{" "}
            <strong className="text-foreground">
              gelir vergisinden sorumlu kiracı
            </strong>
            , her ay kira üzerinden stopaj (gelir vergisi kesintisi) yapar ve
            muhtasar beyanname ile beyan eder. Mal sahibi &quot;net isterim&quot;
            dediğinde brüt kira = net ÷ (1 − stopaj oranı) formülüyle bulunur;
            sözleşmeye mutlaka brüt tutar ve net mutabakatı yazılmalıdır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Oran değişebilir — teyit edin
          </h2>
          <p>
            İş yeri kira stopajı oranı mevzuatla güncellenmiştir; araç varsayılan
            olarak bilinen oranı kullanır ama girdiğiniz oranı serbestçe
            değiştirebilirsiniz. Kurumsal mal sahibine kiralamada stopaj yerine
            KDV ve GVK geçici madde uygulamaları devreye girer.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Danışman için neden önemli?
          </h2>
          <p>
            Ticari taşınmaz pazarlığında taraflar genellikle net üzerinden
            konuşur; sözleşme ise brüt yazılır. Aradaki farkı görüşme masasında
            hesaplayamayan danışman, anlaşma rakamını geçersiz kılan sürprizle
            karşılaşır.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Stopajı kim beyan eder?",
          cevap:
            "Kiracı, ödeme yaptığı ayda kirasından stopaj keser ve bu kesintiyi takip eden ay içinde muhtasar beyanname ile beyan edip öder. Mal sahibi, yıllık gelir vergisi beyannamesinde kesilen bu stopajı hesaplanan vergiden mahsup eder.",
        },
        {
          soru: "KDV işin içinde mi?",
          cevap:
            "Mal sahibi işletme (kira geliri ticari kazanç) ise KDV ve tevsik farklı işler; araç, gerçek kişi mal sahibi için gelir vergisi stopajı odaklıdır.",
        },
      ]}
    />
  );
}
