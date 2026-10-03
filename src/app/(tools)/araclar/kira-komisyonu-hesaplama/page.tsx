import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { KiraKomisyonHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("kira-komisyonu-hesaplama");

export const metadata = aracMetadata(
  "kira-komisyonu-hesaplama",
  "Kiralama komisyonu hesaplama: yasal tavana göre (en fazla bir aylık kira) hizmet bedelini ve KDV dahil toplamı bulun. Ücretsiz, üyeliksiz.",
);

export default function KiraKomisyonuPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<KiraKomisyonHesaplayici />}
      iliskili={["komisyon-hesaplama", "isyeri-net-brut-kira-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Kiralamada komisyon tavanı
          </h2>
          <p>
            Taşınmaz Ticareti Hakkında Yönetmelik&apos;e göre kiralama işleminde
            hizmet bedeli, sözleşmedeki{" "}
            <strong className="text-foreground">
              bir aylık kira bedelinden fazla olamaz
            </strong>
            . KDV ayrıca eklenir. Bu araç tavanı varsayar; daha düşük
            anlaşıldıysa &quot;kaç kira&quot; alanını değiştirin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Komisyonu kim öder?
          </h2>
          <p>
            Uygulamada hizmet bedeli kiracı ve mal sahibi arasında eşit
            paylaştırılması yaygındır; ancak yasal olarak yükümlülük,
            danışmanla kim sözleşme yaptıysa ona aittir. Tarafların
            anlaşmasına göre paylaşımı araçtaki kutucuyla değiştirin.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kiracı için tahliye sonrası iade yok
          </h2>
          <p>
            Erken tahliye halinde komisyon genelde iade edilmez; sözleşme ve
            görüşme öncesinde bu hususu netleştirin. Hesaplama yalnızca kaba
            taslak içindir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Kiralama komisyonu ne kadar?",
          cevap:
            "Yasal üst sınır, sözleşmedeki bir aylık kira bedelidir; KDV hariç. Bazı işlemlerde daha düşük oran anlaşılabilir.",
        },
        {
          soru: "Komisyon KDV dahil mi?",
          cevap:
            "Hayır, hizmet bedeline %20 KDV ayrıca eklenir; araç KDV dahil toplamı ayrıca gösterir.",
        },
      ]}
    />
  );
}
