import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { KomisyonHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("komisyon-hesaplama");

export const metadata = aracMetadata(
  "komisyon-hesaplama",
  "Satış bedeline göre emlak komisyonunu KDV dahil hesaplayın. Taşınmaz Ticareti Yönetmeliği'ne göre %4 hizmet bedeli üst sınırı, alıcı ve satıcı payları ve örnek hesaplamalar.",
);

export default function KomisyonHesaplamaPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KomisyonHesaplayici />}
      iliskili={[
        "komisyon-paylasimi-hesaplama",
        "tapu-harci-hesaplama",
        "kira-getirisi-hesaplama",
      ]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Emlak komisyonu nasıl hesaplanır?
          </h2>
          <p>
            Taşınmaz Ticareti Hakkında Yönetmelik&apos;e göre hizmet bedeli,
            satış sözleşmesinde yer alan bedelin{" "}
            <strong className="text-foreground">%4&aposünü geçemez</strong>.
            Bu tavan, hizmet sunan iki işletmenin paylaşımı dahil toplam tutar
            içindir; KDV ayrıca edilir. Uygulamada alıcıdan %2, satıcıdan %2
            şeklinde kullanılması yaygındır — ancak dağılım tarafların
            anlaşmasına göre değişebilir.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kiralamada komisyon sınırı
          </h2>
          <p>
            Kiralama işlemlerinde hizmet bedeli, sözleşmede yazılı aylık kira
            bedelinin bir aylık tutarından fazla olamaz. Kiralık portföylerde
            danışman paylaşımları için{" "}
            <em>komisyon paylaşımı hesabı</em> aracını kullanın.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Dikkat edilmesi gerekenler
          </h2>
          <p>
            Komisyon, beyan edilen satış bedeli üzerinden konuşulur; tapu harcı
            hesabındaki beyan değeri ile el altından alınan farklı bedeller
            arasındaki tutarsızlık hem alıcı/satıcı hem danışman için hukuki risk
            doğurur. Bu araç kaba taslak içindir; kesin tahsilat sözleşmenize ve
            güncel mevzuata göre belirlenir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Emlak komisyonu kimden alınır?",
          cevap:
            "Yönetmelik hizmet bedelinin kimden alınacağını tarafların anlaşmasına bırakır; satışlarda toplam %4 üst sınıra kadar alıcıdan, satıcıdan ya da ikisinden birlikte alınması yaygındır.",
        },
        {
          soru: "Komisyona KDV dahil mi?",
          cevap:
            "Hayır. Söz konusu edilen hizmet bedeli genelde KDV hariç matrahtır; danışman faturasında KDV ayrıca eklenir. Bu hesaplayıcı KDV hariç ve dahil tutarları birlikte gösterir.",
        },
        {
          soru: "Kiralık işlemlerde komisyon ne kadar?",
          cevap:
            "Kiralama sözleşmesinde belirlenen aylık brüt kira bedelini geçemez; yani en fazla bir kira tutarı kadardır.",
        },
        {
          soru: "Komisyon pazarlıkla artırılabilir mi?",
          cevap:
            "Satışlarda %4 + KDV kanuni tavanı aşılamaz; aşan anlaşmalar geçersizdir ve danışman için idari yaptırım ile iade talebi riski doğurur.",
        },
      ]}
    />
  );
}
