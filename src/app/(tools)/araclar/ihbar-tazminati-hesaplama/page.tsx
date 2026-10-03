import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { IhbarTazminatiHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("ihbar-tazminati-hesaplama");

export const metadata = aracMetadata(
  "ihbar-tazminati-hesaplama",
  "İhbar tazminatı hesaplama: kıdem sürenize karşılık gelen yasal ihbar süresini (2-8 hafta), brüt ve net ihbar tazminatını gelir vergisi ve damga vergisi sonrası görün. Ücretsiz, üyeliksiz.",
);

export default function IhbarTazminatiPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<IhbarTazminatiHesaplayici />}
      iliskili={["kidem-tazminati-hesaplama", "gun-sayisi-hesaplama", "kdv-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            İhbar süresi ne kadardır?
          </h2>
          <p>
            4857 sayılı İş Kanunu&apos;na göre hizmet akdini süresiz feshetmek
            isteyen tarafın karşı tarafa uyması gereken bildirim süreleri kıdeme
            göre artar: 6 aydan az çalışanda 2 hafta, 6 ay–1,5 yıl arası 4 hafta,
            1,5–3 yıl arası 6 hafta, 3 yıldan fazla kıdemde 8 hafta. Bu süre
            kadar önceden bildirim yapmayan taraf, süreye karşılık gelen ücreti
            ihbar tazminatı olarak öder.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kıdem tazminatından farkı nedir?
          </h2>
          <p>
            İhbar tazminatı her iki tarafa da işleyebilir: işçi ihbar sürelerine
            uymadan istifa ederse işverene ödeme yapmak zorunda kalabilir. Ayrıca
            ihbar tazminatı, kıdem tazminatından farklı olarak gelir vergisine ve
            damga vergisine tam olarak tabidir; net eline geçen tutar brütten
            belirgin şekilde düşer. Kıdem şartı aranmaz, 1 yılı doldurmamış
            çalışan da ihbar tazminatına hak kazanır.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Hesaplama nasıl yapılır?
          </h2>
          <p>
            Brüt aylık ücret 30&apos;a bölünerek günlük ücret bulunur, ihbar
            süresi (hafta × 7 gün) ile çarpılır. Bu araç giydirilmiş brüt ücret
            üzerinden hesaplar; aidat, yol ve yemek gibi düzenli ödemeleri de
            brüt ücrete ekleyerek girmeniz daha doğru sonuç verir. Ortalama
            gelir vergisi diliminizi bilirseniz ona göre girin; araç varsayılan
            olarak %20&apos;lik alt dilimi esas alır.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "İhbar tazminatı vergiye tabi mi?",
          cevap:
            "Evet. Kıdem tazminatının aksine ihbar tazminatının gelir vergisi istisnası yoktur; tamamı üzerinden gelir vergisi kesilir ve ayrıca ‰7,59 damga vergisi uygulanır.",
        },
        {
          soru: "İstifa eden çalışan ihbar tazminatı öder mi?",
          cevap:
            "Kendi isteğiyle ve ihbar sürelerine uymadan ayrılan çalışan, kıdemine karşılık gelen ihbar süresi ücretini işverene ödemekle yükümlü olabilir. İşverenin haklı nedenle derhal fesih hallerinde ise tazminat doğmaz.",
        },
        {
          soru: "İhbar tazminatı hangi ücretten hesaplanır?",
          cevap:
            "Sadece çıplak ücret değil, düzenli ödenen yol, yemek ve aidat gibi yan ödemelerin de dahil edildiği giydirilmiş brüt ücret esas alınır.",
        },
      ]}
    />
  );
}
