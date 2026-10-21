import { AracSayfasi } from "@/components/tools/AracSayfasi";
import { aracMetadata } from "@/components/tools/arac-metadata";
import { YillikIzinHesaplayici } from "@/components/tools/ToolCalculators";
import { aracBilgisi } from "@/components/tools/tools-config";

const arac = aracBilgisi("yillik-izin-hesaplama");

export const metadata = aracMetadata(
  "yillik-izin-hesaplama",
  "Yıllık ücretli izin hesaplama: kıdem süreniz ve yaşınıza göre İş Kanunu'nun tanıdığı izin gün sayısını (14-20-30 gün) öğrenin. Ücretsiz, üyeliksiz.",
);

export default function YillikIzinPage() {
  return (
    <AracSayfasi
      arac={arac}
      hesaplayici={<YillikIzinHesaplayici />}
      iliskili={["kidem-tazminati-hesaplama", "ihbar-tazminati-hesaplama", "gun-sayisi-hesaplama"]}
      icerik={
        <>
          <h2 className="text-xl font-semibold text-foreground">
            Kaç gün yıllık izin hakkım var?
          </h2>
          <p>
            4857 sayılı İş Kanunu&apos;na göre yıllık ücretli izin süreleri
            kıdeme bağlıdır: bir tam yılını dolduran çalışanda 14 gün; 5 yıldan
            fazla ve 15 yıla kadar kıdemde 20 gün; 15 yıl ve üzeri kıdemde 30
            gün. 18 yaş ve daha küçük yaştaki çalışanlar ile 50 yaş ve
            üzerindekilere kaç yıl kıdemi olursa olsun 20 günden az izin
            verilemez.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            İzin ne zaman başlar, bölünebilir mi?
          </h2>
          <p>
            İzine hak kazanmak için işyerinde toplam bir yıl çalışmış olmak
            gerekir; deneme süresi bu bir yıla dahildir. Bölünerek kullandırılan
            izinlerde bir bölümünün 10 günden az olmaması şarttır. Kalan günler
            çalışma günlerinden sayılır; izin dönemine rastlayan ulusal bayram
            ve genel tatil günleri izinden düşülmez.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Kullanılmayan izin yanar mı?
          </h2>
          <p>
            İzin ücreti, çalışırken ödenemez; ancak iş sözleşmesi
            sona erdiğinde kullanılmamış izin sürelerinin ücreti son ücrete göre
            işveren tarafından ödenmek zorundadır. Zamanaşımı beş yıl olduğundan
            hak kaybı yaşamamak için izin kayıtlarınızı saklamanız önerilir.
          </p>
        </>
      }
      ssclar={[
        {
          soru: "Yıllık izin ücreti kesinti yapılır mı?",
          cevap:
            "Hayır. Yıllık izin süresi için çalışıyormuş gibi tam ücret ödenir; izin sırasında maaşınızdan kesinti yapılamaz.",
        },
        {
          soru: "İşveren izin vermemezlik edebilir mi?",
          cevap:
            "İzin talebi işyeri izin kurulu düzenine göre planlanır ancak kanuni hak kullandırılmak zorundadır; kullandırılmaması işçiye haklı fesih nedeni oluşturur.",
        },
        {
          soru: "Kısmi süreli (part-time) çalışanda izin farklı mı?",
          cevap:
            "Oranlıdır: part-time çalışan, tam süreli muadiliyle aynı gün sayısında izin hakkına sahiptir; süre, çalışma gününe orantılanarak kullandırılır.",
        },
      ]}
    />
  );
}
